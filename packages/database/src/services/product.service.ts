import type {
  IProductService,
  TUpdateProductData,
  ITopSellingProduct,
  TGetAllOptions,
} from "./interfaces";
import {
  products,
  type TProduct,
  type TNewProduct,
} from "../schemas/product.schema";
import { type IDatabase } from "../client";
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
  isNull,
  lte,
  type SQL,
  inArray,
} from "drizzle-orm";
import { orderItems, orders } from "../schemas";

export class ProductService implements IProductService {
  constructor(protected readonly db: IDatabase) {}

  async create(data: TNewProduct): Promise<TProduct | undefined> {
    const [newProduct] = await this.db
      .insert(products)
      .values(data)
      .returning();
    return newProduct;
  }

  async update(
    id: string,
    data: TUpdateProductData,
  ): Promise<TProduct | undefined> {
    const [updatedProduct] = await this.db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
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

  async getById(id: string): Promise<TProduct | undefined> {
    const product = await this.db.query.products.findFirst({
      where: {
        id, // eq products.id == id
        deletedAt: { isNull: true },
      },
    });
    return product;
  }

  /**
   * Fetches products page based on filters, sorting, and cursor pagination.
   * Uses limit+1 to check if there is an additional page available.
   */
  async getAll(limit = 20, options?: TGetAllOptions) {
    const sort = options?.sort ?? "newest";
    const isGoingBack = !!options?.before;
    const filters = this.buildGetAllFilters(options);

    // Build dynamic orderBy columns (using direct column references)
    let orderByColumns;
    if (sort === "price_asc") {
      orderByColumns = isGoingBack
        ? [desc(products.price), desc(products.id)]
        : [asc(products.price), asc(products.id)];
    } else if (sort === "price_desc") {
      orderByColumns = isGoingBack
        ? [asc(products.price), asc(products.id)]
        : [desc(products.price), desc(products.id)];
    } else {
      orderByColumns = isGoingBack
        ? [asc(products.createdAt), asc(products.id)]
        : [desc(products.createdAt), desc(products.id)];
    }

    // Use the standard query builder (not the relational one) to support complex
    // where conditions (inArray, raw SQL for JSONB specs, etc.) without triggering
    // "Unknown relational filter field" errors from relationsFilterToSQL in Drizzle v1.
    const whereExpr = filters.length > 0 ? and(...filters) : undefined;

    const allProducts = await this.db
      .select()
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
        if (sort === "price_asc" || sort === "price_desc") {
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

    return { data, hasMore, nextCursor, prevCursor };
  }

  async getTopSellingProducts(limit: number): Promise<ITopSellingProduct[]> {
    const result = await this.db
      .select({
        id: orderItems.productId,
        name: products.name,
        sold: sql<number>`sum(${orderItems.quantity})::integer`,
        price: products.price,
        images: products.images,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(ne(orders.status, "cancelled"))
      .groupBy(
        orderItems.productId,
        products.name,
        products.price,
        products.images,
      )
      .orderBy(desc(products.totalSalesCache))
      .limit(limit);

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      sold: r.sold,
      price: r.price,
      image: r.images[0] ?? null,
    }));
  }

  /**
   * Dynamically constructs SQL filters for the product catalog query.
   * Handles cursor-based pagination, category filtering, search, and specification filters.
   */
  private buildGetAllFilters(options?: TGetAllOptions): SQL[] {
    const sort = options?.sort ?? "newest";

    const rawFilters = [
      this.buildCursorCondition(sort, options?.after),
      this.buildCursorCondition(sort, undefined, options?.before),
      this.buildStatusFilter(options?.status),
      this.buildCategoryFilter(options?.categoryId, options?.categoryIds),
      this.buildBrandFilter(options?.brandId, options?.brandIds),
      this.buildQuoteOnlyFilter(options?.isQuoteOnly),
      options?.search
        ? or(
            this.buildSpecLikeFilter("model", options.search),
            sql`${products.name} ILIKE ${`%${options.search}%`}`,
          )
        : undefined,
      isNull(products.deletedAt),
      this.buildSpecCondition("fuelType", options?.fuelType),
      this.buildSpecCondition("phase", options?.phase),
      this.buildSpecCondition("voltage", options?.voltage),
      this.buildMinMaxPower(options?.minPower),
      this.buildMinMaxPower(undefined, options?.maxPower),
      this.buildSpecLikeFilter("engineBrand", options?.engineBrand),
      this.buildSpecLikeFilter("alternatorBrand", options?.alternatorBrand),
    ];

    return rawFilters.filter((f): f is SQL => f !== undefined);
  }

  private buildCursorCondition(
    sort: TGetAllOptions["sort"],
    after?: string,
    before?: string,
  ) {
    const cursor = after ?? before;
    if (!cursor) return undefined;

    if (sort !== "price_asc" && sort !== "price_desc")
      return after
        ? lt(products.createdAt, new Date(after))
        : gt(products.createdAt, new Date(before!));

    const [p, id] = cursor.split("_");
    if (!p || !id) return undefined;

    const priceNum = sql`${products.price}::numeric`;
    const pNum = sql`${p}::numeric`;

    if (sort === "price_asc") {
      return after
        ? sql`${priceNum} > ${pNum} OR ${priceNum} = ${pNum} AND ${products.id} > ${id}`
        : sql`${priceNum} < ${pNum} OR ${priceNum} = ${pNum} AND ${products.id} < ${id}`;
    } else {
      return after
        ? sql`${priceNum} < ${pNum} OR ${priceNum} = ${pNum} AND ${products.id} > ${id}`
        : sql`${priceNum} > ${pNum} OR ${priceNum} = ${pNum} AND ${products.id} < ${id}`;
    }
  }

  private buildBrandFilter(brandId?: string, brandIds?: string[]) {
    if (brandIds && brandIds.length > 0)
      return inArray(products.brandId, brandIds);
    if (brandId) return eq(products.brandId, brandId);
    return undefined;
  }

  private buildCategoryFilter(categoryId?: string, categoryIds?: string[]) {
    if (categoryIds && categoryIds.length > 0)
      return inArray(products.categoryId, categoryIds);
    if (categoryId) return eq(products.categoryId, categoryId);
    return undefined;
  }

  private buildSpecCondition(key: string, value?: string | number) {
    if (value === undefined || value === null) return undefined;

    const column = products.specs;

    if (["voltage"].includes(key))
      return sql`${this.getNumericSpec(key)} = ${value}`;

    // Các field string thông thường (fuelType, phase, engineBrand, alternatorBrand)
    return sql`${column}->>${key} = ${value}`;
  }

  private buildMinMaxPower(minPower?: number, maxPower?: number) {
    if (!minPower && !maxPower) return undefined;

    const key = "power";
    if (minPower)
      return sql`${this.getNumericSpec(key)} >= ${minPower}
      `;
    if (maxPower)
      return sql`${this.getNumericSpec(key)} <= ${maxPower}
      `;
  }

  private buildStatusFilter(status?: "active" | "outOfStock") {
    if (status === "active") return gt(products.totalStockCache, 0);
    if (status === "outOfStock") return lte(products.totalStockCache, 0);
    return undefined;
  }

  private buildQuoteOnlyFilter(isQuoteOnly?: boolean) {
    if (!isQuoteOnly) return undefined;
    return eq(products.isQuoteOnly, isQuoteOnly);
  }

  private buildSpecLikeFilter(key: string, value?: string) {
    if (!value) return undefined;
    return sql`${products.specs}->>${key} ILIKE ${`%${value}%`}`;
  }

  private getNumericSpec(key: string) {
    return sql`
      CASE
        WHEN ${products.specs}->>${key} ~ '^\\s*\\d+(\\.\\d+)?\\s*$'
          THEN (${products.specs}->>${key})::numeric
          ELSE NULL
      END
    `;
  }
}
