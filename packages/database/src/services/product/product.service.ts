import type {
  ProductService,
  UpdateProductData,
  TopSellingProduct,
  GetAllOptions,
  ProductFilterMetadata,
} from "../interfaces";
import type { ProductDTO } from "../../schemas";
import { products, type NewProduct } from "../../schemas/product.schema";
import { type IDatabase } from "../../client";
import {
  and,
  asc,
  desc,
  eq,
  ne,
  sql,
  or,
  gt,
  lt,
  gte,
  lte,
  isNull,
  ilike,
  inArray,
  type SQL,
} from "drizzle-orm";
import type {
  ProductType,
  PowerPhase,
  FuelType,
  CanopyType,
  UpsTopology,
} from "@nhatnang/core";
import { orderItems, orders } from "../../schemas";

const productDtoColumns = {
  id: products.id,
  nameVi: products.nameVi,
  nameEn: products.nameEn,
  slug: products.slug,
  price: products.price,
  descriptionVi: products.descriptionVi,
  descriptionEn: products.descriptionEn,
  shortDescriptionVi: products.shortDescriptionVi,
  shortDescriptionEn: products.shortDescriptionEn,
  images: products.images,
  brandId: products.brandId,
  categoryId: products.categoryId,
  productType: products.productType,
  powerKva: products.powerKva,
  powerKw: products.powerKw,
  standbyPowerKva: products.standbyPowerKva,
  standbyPowerKw: products.standbyPowerKw,
  phase: products.phase,
  voltage: products.voltage,
  frequency: products.frequency,
  fuelType: products.fuelType,
  canopyType: products.canopyType,
  startMethod: products.startMethod,
  engineBrand: products.engineBrand,
  alternatorBrand: products.alternatorBrand,
  upsTopology: products.upsTopology,
  upsBatteryType: products.upsBatteryType,
  specSheet: products.specSheet,
  specs: products.specs,
  totalStockCache: products.totalStockCache,
  isQuoteOnly: products.isQuoteOnly,
};

export class DbProductService implements ProductService {
  constructor(protected readonly db: IDatabase) {}

  async create(data: NewProduct): Promise<ProductDTO> {
    const [newProduct] = await this.db
      .insert(products)
      .values(data)
      .returning(productDtoColumns);
    if (!newProduct) {
      throw new Error("errors.createProductFailed");
    }
    return newProduct;
  }

  async update(id: string, data: UpdateProductData): Promise<ProductDTO> {
    const [updatedProduct] = await this.db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning(productDtoColumns);
    if (!updatedProduct) {
      throw new Error("errors.productNotFound");
    }
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const [deletedProduct] = await this.db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return !!deletedProduct;
  }

  async getById(id: string): Promise<ProductDTO> {
    const [product] = await this.db
      .select(productDtoColumns)
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);

    if (!product) throw new Error("errors.productNotFound");
    return product;
  }

  async getAll(limit = 20, options?: GetAllOptions) {
    const sort = options?.sort ?? "newest";
    const isGoingBack = !!options?.before;
    const filters = this.buildGetAllFilters(options);

    let orderByColumns;
    if (sort === "priceAsc") {
      orderByColumns = isGoingBack
        ? [desc(products.price), desc(products.id)]
        : [asc(products.price), asc(products.id)];
    } else if (sort === "priceDesc") {
      orderByColumns = isGoingBack
        ? [asc(products.price), asc(products.id)]
        : [desc(products.price), desc(products.id)];
    } else {
      orderByColumns = isGoingBack
        ? [asc(products.createdAt), asc(products.id)]
        : [desc(products.createdAt), desc(products.id)];
    }

    const whereExpr = filters.length > 0 ? and(...filters) : undefined;

    const allProducts = await this.db
      .select({
        ...productDtoColumns,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(whereExpr)
      .orderBy(...orderByColumns)
      .limit(limit + 1);

    const hasMore = allProducts.length > limit;
    let data = hasMore ? allProducts.slice(0, -1) : allProducts;

    if (isGoingBack) {
      data = data.reverse();
    }

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (data.length > 0) {
      const lastItem = data[data.length - 1];
      const firstItem = data[0];

      if (lastItem && firstItem) {
        if (sort === "priceAsc" || sort === "priceDesc") {
          nextCursor =
            (!isGoingBack && hasMore) || (isGoingBack && options?.before)
              ? `${lastItem.price}_${lastItem.id}`
              : undefined;
          prevCursor =
            (isGoingBack && hasMore) || (!isGoingBack && options?.after)
              ? `${firstItem.price}_${firstItem.id}`
              : undefined;
        } else {
          nextCursor =
            (!isGoingBack && hasMore) || (isGoingBack && options?.before)
              ? lastItem.createdAt?.toISOString()
              : undefined;
          prevCursor =
            (isGoingBack && hasMore) || (!isGoingBack && options?.after)
              ? firstItem.createdAt?.toISOString()
              : undefined;
        }
      }
    }

    const mappedData: ProductDTO[] = data.map(
      ({ createdAt: _c, ...rest }) => rest,
    );

    return { data: mappedData, hasMore, nextCursor, prevCursor };
  }

  async getTopSellingProducts(limit: number): Promise<TopSellingProduct[]> {
    const result = await this.db
      .select({
        id: orderItems.productId,
        nameVi: products.nameVi,
        nameEn: products.nameEn,
        sold: sql<number>`sum(${orderItems.quantity})::integer`,
        price: products.price,
        images: products.images,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(ne(orders.status, "CANCELLED"))
      .groupBy(
        orderItems.productId,
        products.nameVi,
        products.nameEn,
        products.price,
        products.images,
      )
      .orderBy(desc(sql<number>`sum(${orderItems.quantity})`))
      .limit(limit);

    return result.map((r) => ({
      id: r.id,
      nameVi: r.nameVi,
      nameEn: r.nameEn,
      sold: r.sold,
      price: r.price,
      image: r.images[0] ?? null,
    }));
  }

  async getFiltersMetadata(): Promise<ProductFilterMetadata[]> {
    const result = await this.db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        brandId: products.brandId,
        nameVi: products.nameVi,
        nameEn: products.nameEn,
        power: products.powerKva,
        voltage: products.voltage,
        phase: products.phase,
        model: sql<string | null>`${products.specs}->>'model'`,
        fuelType: products.fuelType,
        engineBrand: products.engineBrand,
        alternatorBrand: products.alternatorBrand,
      })
      .from(products)
      .where(isNull(products.deletedAt));

    return result.map(
      (r) =>
        ({
          id: r.id,
          categoryId: r.categoryId,
          brandId: r.brandId,
          nameVi: r.nameVi,
          nameEn: r.nameEn,
          specs: {
            power: r.power ? Number(r.power) : null,
            voltage: r.voltage ? Number(r.voltage) : null,
            phase: r.phase,
            model: r.model,
            fuelType: r.fuelType,
            engineBrand: r.engineBrand,
            alternatorBrand: r.alternatorBrand,
          },
        }) as ProductFilterMetadata,
    );
  }

  async getAllActiveSlugs(): Promise<string[]> {
    const allProducts = await this.db
      .select({ slug: products.slug })
      .from(products)
      .where(isNull(products.deletedAt));
    return allProducts.map((p) => p.slug);
  }

  async getActiveProductBySlug(slug: string): Promise<ProductDTO> {
    const [product] = await this.db
      .select(productDtoColumns)
      .from(products)
      .where(and(eq(products.slug, slug), isNull(products.deletedAt)))
      .limit(1);
    if (!product) throw new Error("errors.productNotFound");
    return product;
  }

  private buildGetAllFilters(options?: GetAllOptions): SQL[] {
    const conditions: (SQL | undefined)[] = [
      isNull(products.deletedAt),
      this.buildCursorCondition(options?.sort, options?.after, options?.before),
    ];

    if (options?.status === "active") {
      conditions.push(gt(products.totalStockCache, 0));
    }
    if (options?.status === "outOfStock") {
      conditions.push(lte(products.totalStockCache, 0));
    }

    if (options?.categoryIds && options.categoryIds.length > 0) {
      conditions.push(inArray(products.categoryId, options.categoryIds));
    } else if (options?.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }

    if (options?.brandIds && options.brandIds.length > 0) {
      conditions.push(inArray(products.brandId, options.brandIds));
    } else if (options?.brandId) {
      conditions.push(eq(products.brandId, options.brandId));
    }

    if (options?.isQuoteOnly !== undefined) {
      conditions.push(eq(products.isQuoteOnly, options.isQuoteOnly));
    }

    if (options?.productType) {
      conditions.push(
        eq(products.productType, options.productType as ProductType),
      );
    }

    if (options?.fuelType) {
      conditions.push(eq(products.fuelType, options.fuelType as FuelType));
    }

    if (options?.phase) {
      conditions.push(eq(products.phase, options.phase as PowerPhase));
    }

    if (options?.canopyType) {
      conditions.push(
        eq(products.canopyType, options.canopyType as CanopyType),
      );
    }

    if (options?.upsTopology) {
      conditions.push(
        eq(products.upsTopology, options.upsTopology as UpsTopology),
      );
    }

    if (options?.voltage !== undefined && options.voltage !== null) {
      conditions.push(ilike(products.voltage, `%${options.voltage}%`));
    }

    if (options?.minPower) {
      conditions.push(gte(products.powerKva, options.minPower.toString()));
    }

    if (options?.maxPower) {
      conditions.push(lte(products.powerKva, options.maxPower.toString()));
    }

    if (options?.engineBrand) {
      conditions.push(ilike(products.engineBrand, `%${options.engineBrand}%`));
    }

    if (options?.alternatorBrand) {
      conditions.push(
        ilike(products.alternatorBrand, `%${options.alternatorBrand}%`),
      );
    }

    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(products.nameVi, searchPattern),
          ilike(products.nameEn, searchPattern),
          ilike(products.slug, searchPattern),
          sql`${products.specs}->>'model' ILIKE ${searchPattern}`,
        ),
      );
    }

    return conditions.filter((c): c is SQL => c !== undefined);
  }

  private buildCursorCondition(
    sort: GetAllOptions["sort"],
    after?: string,
    before?: string,
  ): SQL | undefined {
    const cursor = after ?? before;
    if (!cursor) return undefined;

    if (sort !== "priceAsc" && sort !== "priceDesc") {
      return after
        ? lt(products.createdAt, new Date(after))
        : gt(products.createdAt, new Date(before!));
    }

    const [priceStr, id] = cursor.split("_");
    if (!priceStr || !id) return undefined;

    if (sort === "priceAsc") {
      return after
        ? or(
            gt(products.price, priceStr),
            and(eq(products.price, priceStr), gt(products.id, id)),
          )
        : or(
            lt(products.price, priceStr),
            and(eq(products.price, priceStr), lt(products.id, id)),
          );
    } else {
      return after
        ? or(
            lt(products.price, priceStr),
            and(eq(products.price, priceStr), gt(products.id, id)),
          )
        : or(
            gt(products.price, priceStr),
            and(eq(products.price, priceStr), lt(products.id, id)),
          );
    }
  }
}
