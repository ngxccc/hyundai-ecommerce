import type { IBrandService } from "./brand.service.interface";
import { brands, type TBrand } from "../schemas/brand.schema";
import { type IDatabase } from "../client";
import { eq } from "drizzle-orm";
import type { TCreateBrandInput, TUpdateBrandInput } from "../validators";
import type { TActionResult } from "@nhatnang/types";
import { isUniqueConstraintError } from "../utils";

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
    const [brand] = await this.db.select().from(brands).where(eq(brands.id, id)).limit(1);
    return brand;
  }

  async create(input: TCreateBrandInput): Promise<TActionResult<TBrand>> {
    try {
      const [newBrand] = await this.db.insert(brands).values(input).returning();
      if (!newBrand)
        return {
          success: false,
          code: "INTERNAL_SERVER_ERROR",
          error: "Failed to create brand",
        };
      return { success: true, data: newBrand };
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "validation.slugExists",
        };
      }
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to create brand",
      };
    }
  }

  async update({
    id,
    ...data
  }: TUpdateBrandInput): Promise<TActionResult<TBrand>> {
    try {
      const [updatedBrand] = await this.db
        .update(brands)
        .set(data)
        .where(eq(brands.id, id))
        .returning();
      if (!updatedBrand)
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "Brand not found",
        };
      return { success: true, data: updatedBrand };
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        return {
          success: false,
          code: "VALIDATION_ERROR",
          error: "validation.slugExists",
        };
      }
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to update brand",
      };
    }
  }

  async delete(id: string): Promise<TActionResult<boolean>> {
    try {
      await this.db.delete(brands).where(eq(brands.id, id));
      return { success: true, data: true };
    } catch (error: unknown) {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          error instanceof Error ? error.message : "Failed to delete brand",
      };
    }
  }
}
