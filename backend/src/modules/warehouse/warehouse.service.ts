import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  products,
  warehouses,
  warehouseStocks,
  type Warehouse,
} from "@/database/schemas";
import type {
  CreateWarehouseDto,
  UpdateStockDto,
  UpdateWarehouseDto,
  WarehouseResponseDto,
  WarehouseStockResponseDto,
} from "./dto";

/**
 * Service managing physical warehouses and multi-location inventory stock with atomic product cache synchronization.
 */
@Injectable()
export class WarehouseService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves all warehouses ordered by city and name.
   */
  async findAll(includeInactive = false): Promise<WarehouseResponseDto[]> {
    const records = await this.db
      .select()
      .from(warehouses)
      .where(includeInactive ? undefined : eq(warehouses.isActive, true))
      .orderBy(asc(warehouses.city), asc(warehouses.nameVi));

    return records.map((r) => this.mapWarehouseToDto(r));
  }

  /**
   * Retrieves single warehouse details by UUID.
   */
  async findById(id: string): Promise<WarehouseResponseDto> {
    const [record] = await this.db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);

    if (!record) {
      throw new NotFoundException(`Warehouse with ID "${id}" not found`);
    }

    return this.mapWarehouseToDto(record);
  }

  /**
   * Creates a new warehouse.
   */
  async create(dto: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    const [created] = await this.db
      .insert(warehouses)
      .values({
        nameVi: dto.nameVi,
        nameEn: dto.nameEn ?? null,
        streetAddress: dto.streetAddress,
        district: dto.district,
        city: dto.city,
        isActive: dto.isActive,
      })
      .returning();

    if (!created) {
      throw new BadRequestException("Failed to create warehouse record");
    }

    return this.mapWarehouseToDto(created);
  }

  /**
   * Updates an existing warehouse.
   */
  async update(
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<WarehouseResponseDto> {
    await this.findById(id);

    const updateValues: Partial<typeof warehouses.$inferInsert> = {};
    if (dto.nameVi !== undefined) updateValues.nameVi = dto.nameVi;
    if (dto.nameEn !== undefined) updateValues.nameEn = dto.nameEn;
    if (dto.streetAddress !== undefined)
      updateValues.streetAddress = dto.streetAddress;
    if (dto.district !== undefined) updateValues.district = dto.district;
    if (dto.city !== undefined) updateValues.city = dto.city;
    if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;
    updateValues.updatedAt = new Date();

    const [updated] = await this.db
      .update(warehouses)
      .set(updateValues)
      .where(eq(warehouses.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Warehouse with ID "${id}" not found`);
    }

    return this.mapWarehouseToDto(updated);
  }

  /**
   * Deactivates a warehouse.
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await this.db
      .update(warehouses)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(warehouses.id, id));
  }

  /**
   * Retrieves all product stocks located in a specific warehouse.
   */
  async getWarehouseStocks(
    warehouseId: string,
  ): Promise<WarehouseStockResponseDto[]> {
    await this.findById(warehouseId);

    const records = await this.db
      .select({
        stock: warehouseStocks,
        product: {
          id: products.id,
          nameVi: products.nameVi,
          slug: products.slug,
          totalStockCache: products.totalStockCache,
        },
      })
      .from(warehouseStocks)
      .innerJoin(products, eq(warehouseStocks.productId, products.id))
      .where(
        and(
          eq(warehouseStocks.warehouseId, warehouseId),
          isNull(products.deletedAt),
        ),
      )
      .orderBy(asc(products.nameVi));

    return records.map((r) => ({
      warehouseId: r.stock.warehouseId,
      productId: r.stock.productId,
      stock: r.stock.stock,
      minStockWarning: r.stock.minStockWarning,
      createdAt: r.stock.createdAt,
      updatedAt: r.stock.updatedAt,
      product: r.product,
    }));
  }

  /**
   * Retrieves stock distribution across all warehouses for a given product.
   */
  async getProductStocks(
    productId: string,
  ): Promise<WarehouseStockResponseDto[]> {
    const [product] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    const records = await this.db
      .select({
        stock: warehouseStocks,
        warehouse: {
          id: warehouses.id,
          nameVi: warehouses.nameVi,
          city: warehouses.city,
        },
      })
      .from(warehouseStocks)
      .innerJoin(warehouses, eq(warehouseStocks.warehouseId, warehouses.id))
      .where(
        and(
          eq(warehouseStocks.productId, productId),
          eq(warehouses.isActive, true),
        ),
      )
      .orderBy(asc(warehouses.city), asc(warehouses.nameVi));

    return records.map((r) => ({
      warehouseId: r.stock.warehouseId,
      productId: r.stock.productId,
      stock: r.stock.stock,
      minStockWarning: r.stock.minStockWarning,
      createdAt: r.stock.createdAt,
      updatedAt: r.stock.updatedAt,
      warehouse: r.warehouse,
    }));
  }

  /**
   * Updates or initializes product stock in a specific warehouse and atomically synchronizes totalStockCache in a transaction.
   */
  async updateStock(
    warehouseId: string,
    dto: UpdateStockDto,
  ): Promise<WarehouseStockResponseDto> {
    // 1. Verify warehouse exists and is active
    const warehouse = await this.findById(warehouseId);
    if (!warehouse.isActive) {
      throw new BadRequestException(
        "Cannot update inventory in an inactive warehouse",
      );
    }

    // 2. Verify product exists and is not deleted
    const [product] = await this.db
      .select({
        id: products.id,
        nameVi: products.nameVi,
        slug: products.slug,
      })
      .from(products)
      .where(and(eq(products.id, dto.productId), isNull(products.deletedAt)))
      .limit(1);

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found`,
      );
    }

    // 3. Atomically upsert warehouse stock and synchronize product totalStockCache inside transaction
    const updatedStockRecord = await this.db.transaction(async (tx) => {
      // Upsert per-warehouse stock
      const [upserted] = await tx
        .insert(warehouseStocks)
        .values({
          warehouseId,
          productId: dto.productId,
          stock: dto.stock,
          minStockWarning: dto.minStockWarning,
        })
        .onConflictDoUpdate({
          target: [warehouseStocks.warehouseId, warehouseStocks.productId],
          set: {
            stock: dto.stock,
            minStockWarning: dto.minStockWarning,
            updatedAt: new Date(),
          },
        })
        .returning();
      if (!upserted) {
        throw new BadRequestException(
          "Failed to update warehouse stock record",
        );
      }

      // Recalculate total stock across all warehouses for this product
      const [sumResult] = await tx
        .select({
          total: sql<number>`cast(coalesce(sum(${warehouseStocks.stock}), 0) as int)`,
        })
        .from(warehouseStocks)
        .where(eq(warehouseStocks.productId, dto.productId));

      const totalStockCache = sumResult?.total ?? 0;

      // Update totalStockCache on product table
      await tx
        .update(products)
        .set({
          totalStockCache,
          updatedAt: new Date(),
        })
        .where(eq(products.id, dto.productId));

      return {
        ...upserted,
        totalStockCache,
      };
    });

    return {
      warehouseId,
      productId: dto.productId,
      stock: updatedStockRecord.stock,
      minStockWarning: updatedStockRecord.minStockWarning,
      createdAt: updatedStockRecord.createdAt,
      updatedAt: updatedStockRecord.updatedAt,
      product: {
        id: product.id,
        nameVi: product.nameVi,
        slug: product.slug,
        totalStockCache: updatedStockRecord.totalStockCache,
      },
      warehouse: {
        id: warehouse.id,
        nameVi: warehouse.nameVi,
        city: warehouse.city,
      },
    };
  }

  private mapWarehouseToDto(record: Warehouse): WarehouseResponseDto {
    return {
      id: record.id,
      nameVi: record.nameVi,
      nameEn: record.nameEn,
      streetAddress: record.streetAddress,
      district: record.district,
      city: record.city,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
