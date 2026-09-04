import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { dealerTiers } from "@/database/schemas";
import type { DealerTierResponseDto } from "./dto/dealer-tier-response.dto";

@Injectable()
export class DealerTiersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves all dealer tiers ordered by minimum spend qualification ascending.
   *
   * @returns Array of all registered dealer tiers
   */
  async findAll(): Promise<DealerTierResponseDto[]> {
    return this.db
      .select({
        id: dealerTiers.id,
        nameVi: dealerTiers.nameVi,
        nameEn: dealerTiers.nameEn,
        discountPercentage: dealerTiers.discountPercentage,
        minimumSpend: dealerTiers.minimumSpend,
      })
      .from(dealerTiers)
      .orderBy(asc(dealerTiers.minimumSpend));
  }

  /**
   * Retrieves a single dealer tier by unique ID.
   *
   * @param id - Dealer tier UUID
   * @returns Dealer tier details
   * @throws NotFoundException if tier is not found
   */
  async findById(id: string): Promise<DealerTierResponseDto> {
    const [tier] = await this.db
      .select({
        id: dealerTiers.id,
        nameVi: dealerTiers.nameVi,
        nameEn: dealerTiers.nameEn,
        discountPercentage: dealerTiers.discountPercentage,
        minimumSpend: dealerTiers.minimumSpend,
      })
      .from(dealerTiers)
      .where(eq(dealerTiers.id, id))
      .limit(1);

    if (!tier) {
      throw new NotFoundException(`Dealer tier with id "${id}" not found`);
    }

    return tier;
  }
}
