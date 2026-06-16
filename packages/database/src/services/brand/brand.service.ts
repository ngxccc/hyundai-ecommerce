import type { BrandService } from "../interfaces";
import { mapBrandToDTO, type BrandDTO } from "../../dtos";
import { brands } from "../../schemas/brand.schema";
import { type IDatabase } from "../../client";
import { eq } from "drizzle-orm";
import type { TCreateBrandInput, TUpdateBrandInput } from "../../validators";
import { handleServiceError } from "../../utils";

export class DbBrandService implements BrandService {
  constructor(protected readonly db: IDatabase) {}

  async getAll(): Promise<BrandDTO[]> {
    const allBrands = await this.db.query.brands.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return allBrands.map(mapBrandToDTO);
  }

  async getById(id: string): Promise<BrandDTO | undefined> {
    const [brand] = await this.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);
    return brand ? mapBrandToDTO(brand) : undefined;
  }

  async create(input: TCreateBrandInput): Promise<BrandDTO> {
    try {
      const [newBrand] = await this.db.insert(brands).values(input).returning();
      if (!newBrand) {
        throw new Error("errors.createBrandFailed");
      }
      return mapBrandToDTO(newBrand);
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
        .returning();
      if (!updatedBrand) {
        throw new Error("errors.brandNotFound");
      }
      return mapBrandToDTO(updatedBrand);
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
