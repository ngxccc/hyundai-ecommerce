import type {
  IProductService,
  TUpdateProductData,
} from "./product.service.interface";
import {
  products,
  type TProduct,
  type TNewProduct,
} from "../schemas/product.schema";
import { type IDatabase } from "../client";
import { eq, sql } from "drizzle-orm";

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

  async getAll(
    limit = 20,
    options?: {
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
    },
  ) {
    const isGoingBack = !!options?.before;

    const andFilters = [
      options?.after
        ? { createdAt: { lt: new Date(options.after) } }
        : undefined,
      options?.before
        ? { createdAt: { gt: new Date(options.before) } }
        : undefined,
      options?.categoryId
        ? { categoryId: { eq: options.categoryId } }
        : undefined,
      options?.brandId ? { brandId: { eq: options.brandId } } : undefined,
      options?.isQuoteOnly ? { isQuoteOnly: { eq: true } } : undefined,
      options?.search
        ? {
            OR: [
              { name: { ilike: `%${options.search}%` } },
              {
                RAW: (table: TProduct) =>
                  sql`${table.specs}->>'model' ILIKE ${`%${options.search}%`}`,
              },
            ],
          }
        : undefined,
      { deletedAt: { isNull: true } },
      options?.status === "active" ? { totalStockCache: { gt: 0 } } : undefined,
      options?.status === "outOfStock"
        ? { totalStockCache: { lte: 0 } }
        : undefined,
      options?.fuelType
        ? {
            RAW: (table: TProduct) =>
              sql`${table.specs}->>'fuelType' = ${options.fuelType}`,
          }
        : undefined,
      options?.phase
        ? {
            RAW: (table: TProduct) =>
              sql`${table.specs}->>'phase' = ${options.phase}`,
          }
        : undefined,
      options?.voltage !== undefined
        ? {
            RAW: (table: TProduct) =>
              sql`CASE WHEN ${table.specs}->>'voltage' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'voltage')::numeric ELSE NULL END = ${options.voltage}`,
          }
        : undefined,
      options?.minPower !== undefined
        ? {
            RAW: (table: TProduct) =>
              sql`CASE WHEN ${table.specs}->>'power' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'power')::numeric ELSE NULL END >= ${options.minPower}`,
          }
        : undefined,
      options?.maxPower !== undefined
        ? {
            RAW: (table: TProduct) =>
              sql`CASE WHEN ${table.specs}->>'power' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'power')::numeric ELSE NULL END <= ${options.maxPower}`,
          }
        : undefined,
      options?.engineBrand
        ? {
            RAW: (table: TProduct) =>
              sql`${table.specs}->>'engineBrand' ILIKE ${`%${options.engineBrand}%`}`,
          }
        : undefined,
      options?.alternatorBrand
        ? {
            RAW: (table: TProduct) =>
              sql`${table.specs}->>'alternatorBrand' ILIKE ${`%${options.alternatorBrand}%`}`,
          }
        : undefined,
    ].filter(Boolean) as [];

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
}
