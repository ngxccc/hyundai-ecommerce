import type { IBrandService } from "./brand.service.interface";
import { type TBrand } from "../schemas/brand.schema";
import { type IDatabase } from "../client";

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
}
