import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  brands,
  categories,
  products,
  type Brand,
  type Category,
  type Product,
} from "@/database/schemas";
import {
  buildPaginationMeta,
  type PaginationMetaDto,
} from "@/common/dto/pagination-meta.dto";
import type {
  CreateProductDto,
  ProductMetadataResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from "./dto";
import type {
  BrandFacetItem,
  CategoryFacetItem,
  ValueCountFacetItem,
} from "./dto/product-metadata-response.dto";
import { productFilters } from "./filters";

/**
 * Maps incoming CreateProductDto values into Drizzle database insert values.
 */
function toProductInsertValues(
  dto: CreateProductDto,
): typeof products.$inferInsert {
  return {
    nameVi: dto.nameVi,
    nameEn: dto.nameEn ?? null,
    slug: dto.slug,
    price: String(dto.price),
    descriptionVi: dto.descriptionVi ?? null,
    descriptionEn: dto.descriptionEn ?? null,
    shortDescriptionVi: dto.shortDescriptionVi ?? null,
    shortDescriptionEn: dto.shortDescriptionEn ?? null,
    images: dto.images,
    brandId: dto.brandId ?? null,
    categoryId: dto.categoryId ?? null,
    productType: dto.productType,
    powerKva: dto.powerKva != null ? String(dto.powerKva) : null,
    powerKw: dto.powerKw != null ? String(dto.powerKw) : null,
    standbyPowerKva:
      dto.standbyPowerKva != null ? String(dto.standbyPowerKva) : null,
    standbyPowerKw:
      dto.standbyPowerKw != null ? String(dto.standbyPowerKw) : null,
    phase: dto.phase ?? null,
    voltage: dto.voltage ?? null,
    frequency: dto.frequency,
    fuelType: dto.fuelType ?? null,
    canopyType: dto.canopyType ?? null,
    startMethod: dto.startMethod ?? null,
    engineBrand: dto.engineBrand ?? null,
    alternatorBrand: dto.alternatorBrand ?? null,
    upsTopology: dto.upsTopology ?? null,
    upsBatteryType: dto.upsBatteryType ?? null,
    specSheet: dto.specSheet,
    specs: dto.specs,
    totalStockCache: dto.totalStockCache,
    isActive: dto.isActive,
  };
}

/**
 * Maps incoming UpdateProductDto values into Drizzle database update values.
 */
function toProductUpdateValues(
  dto: UpdateProductDto,
): Partial<typeof products.$inferInsert> {
  const updateValues: Partial<typeof products.$inferInsert> = {};
  if (dto.nameVi !== undefined) updateValues.nameVi = dto.nameVi;
  if (dto.nameEn !== undefined) updateValues.nameEn = dto.nameEn;
  if (dto.slug !== undefined) updateValues.slug = dto.slug;
  if (dto.price !== undefined) updateValues.price = String(dto.price);
  if (dto.descriptionVi !== undefined)
    updateValues.descriptionVi = dto.descriptionVi;
  if (dto.descriptionEn !== undefined)
    updateValues.descriptionEn = dto.descriptionEn;
  if (dto.shortDescriptionVi !== undefined)
    updateValues.shortDescriptionVi = dto.shortDescriptionVi;
  if (dto.shortDescriptionEn !== undefined)
    updateValues.shortDescriptionEn = dto.shortDescriptionEn;
  if (dto.images !== undefined) updateValues.images = dto.images;
  if (dto.brandId !== undefined) updateValues.brandId = dto.brandId;
  if (dto.categoryId !== undefined) updateValues.categoryId = dto.categoryId;
  if (dto.productType !== undefined) updateValues.productType = dto.productType;
  if (dto.powerKva !== undefined)
    updateValues.powerKva = dto.powerKva != null ? String(dto.powerKva) : null;
  if (dto.powerKw !== undefined)
    updateValues.powerKw = dto.powerKw != null ? String(dto.powerKw) : null;
  if (dto.standbyPowerKva !== undefined)
    updateValues.standbyPowerKva =
      dto.standbyPowerKva != null ? String(dto.standbyPowerKva) : null;
  if (dto.standbyPowerKw !== undefined)
    updateValues.standbyPowerKw =
      dto.standbyPowerKw != null ? String(dto.standbyPowerKw) : null;
  if (dto.phase !== undefined) updateValues.phase = dto.phase;
  if (dto.voltage !== undefined) updateValues.voltage = dto.voltage;
  if (dto.frequency !== undefined) updateValues.frequency = dto.frequency;
  if (dto.fuelType !== undefined) updateValues.fuelType = dto.fuelType;
  if (dto.canopyType !== undefined) updateValues.canopyType = dto.canopyType;
  if (dto.startMethod !== undefined) updateValues.startMethod = dto.startMethod;
  if (dto.engineBrand !== undefined) updateValues.engineBrand = dto.engineBrand;
  if (dto.alternatorBrand !== undefined)
    updateValues.alternatorBrand = dto.alternatorBrand;
  if (dto.upsTopology !== undefined) updateValues.upsTopology = dto.upsTopology;
  if (dto.upsBatteryType !== undefined)
    updateValues.upsBatteryType = dto.upsBatteryType;
  if (dto.specSheet !== undefined) updateValues.specSheet = dto.specSheet;
  if (dto.specs !== undefined) updateValues.specs = dto.specs;
  if (dto.totalStockCache !== undefined)
    updateValues.totalStockCache = dto.totalStockCache;
  if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;
  updateValues.updatedAt = new Date();
  return updateValues;
}

/**
 * Transforms Drizzle database product record and joined entities into ProductResponseDto.
 */
function mapProductRow(
  product: Product,
  brand?: Brand | null,
  category?: Category | null,
): ProductResponseDto {
  return {
    ...product,
    productType: product.productType ?? "generator",
    powerKva: product.powerKva ?? null,
    powerKw: product.powerKw ?? null,
    standbyPowerKva: product.standbyPowerKva ?? null,
    standbyPowerKw: product.standbyPowerKw ?? null,
    phase: product.phase ?? null,
    voltage: product.voltage ?? null,
    frequency: product.frequency ?? null,
    fuelType: product.fuelType ?? null,
    canopyType: product.canopyType ?? null,
    startMethod: product.startMethod ?? null,
    engineBrand: product.engineBrand ?? null,
    alternatorBrand: product.alternatorBrand ?? null,
    upsTopology: product.upsTopology ?? null,
    upsBatteryType: product.upsBatteryType ?? null,
    specSheet: product.specSheet ?? [],
    specs: (product.specs as ProductResponseDto["specs"] | undefined) ?? {},
    brand: brand?.id ? brand : null,
    category: category?.id ? category : null,
  };
}
/**
 * Core service managing product catalog operations, hybrid faceted search, and metadata aggregation.
 */
@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves paginated products matching hybrid faceted search filters.
   */
  async findProducts(
    query: ProductQueryDto,
  ): Promise<{ items: ProductResponseDto[]; meta: PaginationMetaDto }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const whereClause = and(
      productFilters.isAvailable(),
      productFilters.bySearch(query.search),
      productFilters.byBrandId(query.brandId),
      productFilters.byCategoryId(query.categoryId),
      productFilters.byPriceRange(query.priceMin, query.priceMax),
      productFilters.byPowerRange(query.powerKvaMin, query.powerKvaMax),
      productFilters.byVoltage(query.voltage),
      productFilters.byPhase(query.phase),
      productFilters.byFuelType(query.fuelType),
      productFilters.byCanopyType(query.canopyType),
    );

    let orderByClause = desc(products.createdAt);
    if (query.sort === "priceAsc") {
      orderByClause = asc(products.price);
    } else if (query.sort === "priceDesc") {
      orderByClause = desc(products.price);
    }

    const [countResult] = await this.db
      .select({ total: count() })
      .from(products)
      .where(whereClause);

    const total = countResult?.total ?? 0;

    if (total === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(0, page, limit),
      };
    }

    const records = await this.db
      .select({
        product: products,
        brand: brands,
        category: categories,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const items = records.map((r) =>
      mapProductRow(r.product, r.brand, r.category),
    );

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves aggregated faceted metadata and available filter ranges.
   */
  async getMetadata(): Promise<ProductMetadataResponseDto> {
    const baseCondition = productFilters.isAvailable();

    const [
      [ranges],
      brandCounts,
      categoryCounts,
      fuelTypeCounts,
      phaseCounts,
      canopyTypeCounts,
    ] = await Promise.all([
      this.db
        .select({
          minPower: sql<string>`min(cast(${products.powerKva} as numeric))`,
          maxPower: sql<string>`max(cast(${products.powerKva} as numeric))`,
          minPrice: sql<string>`min(cast(${products.price} as numeric))`,
          maxPrice: sql<string>`max(cast(${products.price} as numeric))`,
        })
        .from(products)
        .where(baseCondition),

      this.db
        .select({
          id: brands.id,
          name: brands.name,
          count: count(products.id),
        })
        .from(products)
        .innerJoin(brands, eq(products.brandId, brands.id))
        .where(baseCondition)
        .groupBy(brands.id, brands.name),

      this.db
        .select({
          id: categories.id,
          nameVi: categories.nameVi,
          nameEn: categories.nameEn,
          count: count(products.id),
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(baseCondition)
        .groupBy(categories.id, categories.nameVi, categories.nameEn),

      this.db
        .select({
          value: products.fuelType,
          count: count(products.id),
        })
        .from(products)
        .where(and(baseCondition, sql`${products.fuelType} is not null`))
        .groupBy(products.fuelType),

      this.db
        .select({
          value: products.phase,
          count: count(products.id),
        })
        .from(products)
        .where(and(baseCondition, sql`${products.phase} is not null`))
        .groupBy(products.phase),

      this.db
        .select({
          value: products.canopyType,
          count: count(products.id),
        })
        .from(products)
        .where(and(baseCondition, sql`${products.canopyType} is not null`))
        .groupBy(products.canopyType),
    ]);

    return {
      brands: brandCounts.map((b): BrandFacetItem => ({
        id: b.id,
        name: b.name,
        count: b.count,
      })),
      categories: categoryCounts.map((c): CategoryFacetItem => ({
        id: c.id,
        nameVi: c.nameVi,
        nameEn: c.nameEn,
        count: c.count,
      })),
      powerRange: {
        min: Number(ranges?.minPower ?? 0),
        max: Number(ranges?.maxPower ?? 2500),
      },
      priceRange: {
        min: Number(ranges?.minPrice ?? 0),
        max: Number(ranges?.maxPrice ?? 10000000000),
      },
      fuelTypes: fuelTypeCounts.map((f): ValueCountFacetItem => ({
        value: f.value ?? "",
        count: f.count,
      })),
      phases: phaseCounts.map((p): ValueCountFacetItem => ({
        value: p.value ?? "",
        count: p.count,
      })),
      canopyTypes: canopyTypeCounts.map((c): ValueCountFacetItem => ({
        value: c.value ?? "",
        count: c.count,
      })),
    };
  }

  /**
   * Retrieves a single product by UUID or slug.
   */
  async findById(idOrSlug: string): Promise<ProductResponseDto> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const [record] = await this.db
      .select({
        product: products,
        brand: brands,
        category: categories,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          isNull(products.deletedAt),
          isUuid ? eq(products.id, idOrSlug) : eq(products.slug, idOrSlug),
        ),
      )
      .limit(1);

    if (!record) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    return mapProductRow(record.product, record.brand, record.category);
  }

  /**
   * Creates a new product.
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const [existingSlug] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, dto.slug))
      .limit(1);

    if (existingSlug) {
      throw new ConflictException(
        `Product with slug "${dto.slug}" already exists`,
      );
    }

    if (dto.brandId) {
      const [brand] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.id, dto.brandId))
        .limit(1);

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID "${dto.brandId}" not found`,
        );
      }
    }

    if (dto.categoryId) {
      const [category] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.categoryId))
        .limit(1);

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${dto.categoryId}" not found`,
        );
      }
    }

    const [newProduct] = await this.db
      .insert(products)
      .values(toProductInsertValues(dto))
      .returning();

    if (!newProduct) {
      throw new BadRequestException("Failed to create product record");
    }

    return mapProductRow(newProduct);
  }

  /**
   * Updates an existing product.
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const [existing] = await this.db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, dto.slug))
        .limit(1);

      if (slugConflict) {
        throw new ConflictException(
          `Product with slug "${dto.slug}" already exists`,
        );
      }
    }

    if (dto.brandId) {
      const [brand] = await this.db
        .select({ id: brands.id })
        .from(brands)
        .where(eq(brands.id, dto.brandId))
        .limit(1);

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID "${dto.brandId}" not found`,
        );
      }
    }

    if (dto.categoryId) {
      const [category] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, dto.categoryId))
        .limit(1);

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${dto.categoryId}" not found`,
        );
      }
    }

    const updatePayload = toProductUpdateValues(dto);

    const [updatedProduct] = await this.db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return mapProductRow(updatedProduct);
  }

  /**
   * Soft deletes an existing product by setting deletedAt timestamp.
   */
  async delete(id: string): Promise<void> {
    const [existing] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    await this.db
      .update(products)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  }
}
