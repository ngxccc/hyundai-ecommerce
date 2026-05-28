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
import { eq } from "drizzle-orm";

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
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return !!deletedProduct;
  }

  async getById(id: string): Promise<TProduct | undefined> {
    const product = await this.db.query.products.findFirst({
      where: {
        id, // eq products.id == id
      },
    });
    return product;
  }

  async getAll(limit = 20, cursor?: { after?: string; before?: string }) {
    const isGoingBack = !!cursor?.before;

    let whereClause = undefined;
    if (cursor?.after) {
      whereClause = { createdAt: { lt: new Date(cursor.after) } };
    } else if (cursor?.before) {
      whereClause = { createdAt: { gt: new Date(cursor.before) } };
    }

    const allProducts = await this.db.query.products.findMany({
      orderBy: {
        createdAt: isGoingBack ? "asc" : "desc",
      },
      limit: limit + 1, // Fetch one extra to determine if there is a next page
      where: whereClause,
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
      (!isGoingBack && hasMore) || (isGoingBack && cursor?.before)
        ? data[data.length - 1]?.createdAt?.toISOString()
        : undefined;

    const prevCursor =
      (isGoingBack && hasMore) || (!isGoingBack && cursor?.after)
        ? data[0]?.createdAt?.toISOString()
        : undefined;

    return { data, nextCursor, prevCursor };
  }
}
