import type { IBrandService } from "./brand.service.interface";
import { brands, type TBrand } from "../schemas/brand.schema";
import { type IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type { TCreateBrandInput, TUpdateBrandInput } from "../validators";
import { handleServiceError } from "../utils";

export class BrandService implements IBrandService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<TBrand[]> {
    const allBrands = await this.db.query.brands.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return allBrands;
  }

  async getById(id: string): Promise<TBrand | undefined> {
    const [brand] = await this.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);
    return brand;
  }

  async create(input: TCreateBrandInput): Promise<TBrand> {
    try {
      const [newBrand] = await this.db.insert(brands).values(input).returning();
      if (!newBrand) {
        throw new Error("errors.createBrandFailed");
      }
      return newBrand;
    } catch (error: unknown) {
      handleServiceError(error, "errors.createBrandFailed");
    }
  }

  async update({ id, ...data }: TUpdateBrandInput): Promise<TBrand> {
    try {
      const [updatedBrand] = await this.db
        .update(brands)
        .set(data)
        .where(eq(brands.id, id))
        .returning();
      if (!updatedBrand) {
        throw new Error("errors.brandNotFound");
      }
      return updatedBrand;
    } catch (error: unknown) {
      handleServiceError(error, "errors.updateBrandFailed");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.delete(brands).where(eq(brands.id, id));
      return true;
    } catch (error: unknown) {
      handleServiceError(error, "errors.deleteBrandFailed");
    }
  }
}
