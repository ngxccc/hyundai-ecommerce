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
import { eq, ne, sql, desc, inArray } from "drizzle-orm";
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
   * Dynamically constructs SQL filters for the product catalog query.
   * Handles cursor-based pagination, category filtering, search, and specification filters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildGetAllFilters(options?: TGetAllOptions): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andFilters: any[] = [];
    const sort = options?.sort ?? "newest";

    // Cursor pagination (after): Fetch elements following the specified key.
    // For sorting options (like price), we use a composite cursor "${value}_${id}" to guarantee
    // a unique, stable order even when multiple products share the exact same price.
    if (options?.after) {
      if (sort === "price_asc") {
        const [p, id] = options.after.split("_");
        if (p && id) {
          andFilters.push(
            sql`(${products.price})::numeric > ${p}::numeric OR ((${products.price})::numeric = ${p}::numeric AND ${products.id} > ${id})`,
          );
        }
      } else if (sort === "price_desc") {
        const [p, id] = options.after.split("_");
        if (p && id) {
          andFilters.push(
            sql`(${products.price})::numeric < ${p}::numeric OR ((${products.price})::numeric = ${p}::numeric AND ${products.id} > ${id})`,
          );
        }
      } else {
        andFilters.push({ createdAt: { lt: new Date(options.after) } });
      }
    }

    // Cursor pagination (before): Fetch preceding elements when scrolling backwards.
    // Reverses inequality direction compared to "after" cursor to traverse the database index in reverse.
    if (options?.before) {
      if (sort === "price_asc") {
        const [p, id] = options.before.split("_");
        if (p && id) {
          andFilters.push(
            sql`(${products.price})::numeric < ${p}::numeric OR ((${products.price})::numeric = ${p}::numeric AND ${products.id} < ${id})`,
          );
        }
      } else if (sort === "price_desc") {
        const [p, id] = options.before.split("_");
        if (p && id) {
          andFilters.push(
            sql`(${products.price})::numeric > ${p}::numeric OR ((${products.price})::numeric = ${p}::numeric AND ${products.id} < ${id})`,
          );
        }
      } else {
        andFilters.push({ createdAt: { gt: new Date(options.before) } });
      }
    }

    // Multi-category filtering: Matches products belonging to any of the specified category IDs (e.g., subcategories).
    if (options?.categoryIds && options.categoryIds.length > 0) {
      andFilters.push(inArray(products.categoryId, options.categoryIds));
    } else if (options?.categoryId) {
      andFilters.push({ categoryId: { eq: options.categoryId } });
    }

    if (options?.brandIds && options.brandIds.length > 0) {
      andFilters.push(inArray(products.brandId, options.brandIds));
    } else if (options?.brandId) {
      andFilters.push({ brandId: { eq: options.brandId } });
    }
    if (options?.isQuoteOnly) andFilters.push({ isQuoteOnly: { eq: true } });

    // Full-text search: Checks matching names or model names inside the specs JSONB field.
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

    // Specifications filtering (stored in JSONB field):
    // For numeric values (voltage, minPower, maxPower), we cast string values inside JSONB to numeric.
    // A regex validation guard (`~ '^\s*\d+(\.\d+)?\s*$'`) is required before casting to prevent
    // query compilation errors when a product has non-numeric characters in its specification values.
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

  /**
   * Fetches products page based on filters, sorting, and cursor pagination.
   * Uses limit+1 to check if there is an additional page available.
   */
  async getAll(limit = 20, options?: TGetAllOptions) {
    const sort = options?.sort ?? "newest";
    const isGoingBack = !!options?.before;
    const andFilters = this.buildGetAllFilters(options);
    // If scrolling backwards (before cursor), we reverse the ORDER BY direction in DB
    // to fetch the immediately preceding elements, then reverse the array back to correct order in JS memory.

    const allProducts = await this.db.query.products.findMany({
      orderBy: (t, { asc, desc }) => {
        if (sort === "price_asc") {
          return isGoingBack
            ? [desc(t.price), desc(t.id)]
            : [asc(t.price), asc(t.id)];
        }
        if (sort === "price_desc") {
          return isGoingBack
            ? [asc(t.price), asc(t.id)]
            : [desc(t.price), desc(t.id)];
        }
        return isGoingBack
          ? [asc(t.createdAt), asc(t.id)]
          : [desc(t.createdAt), desc(t.id)];
      },
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
}
