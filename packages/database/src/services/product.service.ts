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

  async getAll(limit = 20, cursorId?: string): Promise<TProduct[]> {
    const allProducts = await this.db.query.products.findMany({
      orderBy: {
        createdAt: "desc",
      },
      limit,
      where: {
        id: { lt: cursorId },
      },
    });
    return allProducts;
  }
}
