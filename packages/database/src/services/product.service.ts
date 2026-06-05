import type {
  IProductService,
  TUpdateProductData,
  ITopSellingProduct,
} from "./interfaces";
import {
  products,
  type TProduct,
  type TNewProduct,
} from "../schemas/product.schema";
import { type IDatabase } from "../client";
import { eq, ne, sql, desc } from "drizzle-orm";
import { orderItems, orders } from "../schemas";

export interface TGetAllOptions {
  after?: string | undefined;
  before?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
  fuelType?: string | undefined;
  phase?: string | undefined;
  voltage?: number | undefined;
  minPower?: number | undefined;
  maxPower?: number | undefined;
  engineBrand?: string | undefined;
  alternatorBrand?: string | undefined;
  isQuoteOnly?: boolean | undefined;
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildGetAllFilters(options?: TGetAllOptions): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andFilters: any[] = [];

    if (options?.after)
      andFilters.push({ createdAt: { lt: new Date(options.after) } });
    if (options?.before)
      andFilters.push({ createdAt: { gt: new Date(options.before) } });
    if (options?.categoryId)
      andFilters.push({ categoryId: { eq: options.categoryId } });
    if (options?.brandId) andFilters.push({ brandId: { eq: options.brandId } });
    if (options?.isQuoteOnly) andFilters.push({ isQuoteOnly: { eq: true } });
    if (options?.search) {
      andFilters.push({
        OR: [
          { name: { ilike: `%${options.search}%` } },
          {
            RAW: (table: TProduct) =>
              sql`${table.specs}->>'model' ILIKE ${`%${options.search}%`}`,
          },
        ],
      });
    }

    andFilters.push({ deletedAt: { isNull: true } });

    if (options?.status === "active")
      andFilters.push({ totalStockCache: { gt: 0 } });
    if (options?.status === "outOfStock")
      andFilters.push({ totalStockCache: { lte: 0 } });

    if (options?.fuelType) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`${table.specs}->>'fuelType' = ${options.fuelType}`,
      });
    }
    if (options?.phase) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`${table.specs}->>'phase' = ${options.phase}`,
      });
    }
    if (options?.voltage !== undefined) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`CASE WHEN ${table.specs}->>'voltage' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'voltage')::numeric ELSE NULL END = ${options.voltage}`,
      });
    }
    if (options?.minPower !== undefined) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`CASE WHEN ${table.specs}->>'power' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'power')::numeric ELSE NULL END >= ${options.minPower}`,
      });
    }
    if (options?.maxPower !== undefined) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`CASE WHEN ${table.specs}->>'power' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'power')::numeric ELSE NULL END <= ${options.maxPower}`,
      });
    }
    if (options?.engineBrand) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`${table.specs}->>'engineBrand' ILIKE ${`%${options.engineBrand}%`}`,
      });
    }
    if (options?.alternatorBrand) {
      andFilters.push({
        RAW: (table: TProduct) =>
          sql`${table.specs}->>'alternatorBrand' ILIKE ${`%${options.alternatorBrand}%`}`,
      });
    }

    return andFilters;
  }

  async getAll(limit = 20, options?: TGetAllOptions) {
    const isGoingBack = !!options?.before;
    const andFilters = this.buildGetAllFilters(options);

    const allProducts = await this.db.query.products.findMany({
      orderBy: (products, { asc, desc }) =>
        isGoingBack ? [asc(products.createdAt)] : [desc(products.createdAt)],
      limit: limit + 1, // Fetch one extra to determine if there is a next page
      where: andFilters.length > 0 ? { AND: andFilters } : undefined,
      with: {
        categories: true,
      },
    });

    const hasMore = allProducts.length > limit;
    let data = hasMore ? allProducts.slice(0, -1) : allProducts;

    if (isGoingBack) {
      data = data.reverse();
    }

    const nextCursor =
      (!isGoingBack && hasMore) || (isGoingBack && options?.before)
        ? data[data.length - 1]?.createdAt?.toISOString()
        : undefined;

    const prevCursor =
      (isGoingBack && hasMore) || (!isGoingBack && options?.after)
        ? data[0]?.createdAt?.toISOString()
        : undefined;

    return { data, nextCursor, prevCursor };
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
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(limit);

    return result.map((r) => ({
      id: r.id,
      name: r.name,
      sold: r.sold,
      price: r.price,
      image: r.images[0] ?? null,
    }));
  }
}
