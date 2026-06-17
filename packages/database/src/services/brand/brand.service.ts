import type { BrandService } from "../interfaces";
import { type BrandDTO } from "../../dtos";
import { brands } from "../../schemas/brand.schema";
import { type IDatabase } from "../../client";
import { eq } from "drizzle-orm";
import type { TCreateBrandInput, TUpdateBrandInput } from "../../validators";
import { handleServiceError } from "../../utils";

export class DbBrandService implements BrandService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<BrandDTO[]> {
    return this.db.query.brands.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        descriptionVi: true,
        descriptionEn: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(id: string): Promise<BrandDTO> {
    const [brand] = await this.db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logo: brands.logo,
        descriptionVi: brands.descriptionVi,
        descriptionEn: brands.descriptionEn,
        isActive: brands.isActive,
      })
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);
    if (!brand) throw new Error("errors.brandNotFound");
    return brand;
  }

  async create(input: TCreateBrandInput): Promise<BrandDTO> {
    try {
      const [newBrand] = await this.db.insert(brands).values(input).returning({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logo: brands.logo,
        descriptionVi: brands.descriptionVi,
        descriptionEn: brands.descriptionEn,
        isActive: brands.isActive,
      });
      if (!newBrand) {
        throw new Error("errors.createBrandFailed");
      }
      return newBrand;
    } catch (error: unknown) {
      handleServiceError(error, "errors.createBrandFailed");
    }
  }

  async update({ id, ...data }: TUpdateBrandInput): Promise<BrandDTO> {
    try {
      const [updatedBrand] = await this.db
        .update(brands)
        .set(data)
        .where(eq(brands.id, id))
        .returning({
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
          logo: brands.logo,
          descriptionVi: brands.descriptionVi,
          descriptionEn: brands.descriptionEn,
          isActive: brands.isActive,
        });
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
