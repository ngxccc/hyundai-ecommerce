import type { IDealerTierService } from "./interfaces";
import { eq } from "drizzle-orm";
import { type IDatabase } from "../client";
import {
  dealerTiers,
  type TDealerTier,
  type TNewDealerTier,
} from "../schemas/dealer-tier.schema";

export class DealerTierService implements IDealerTierService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Create a new B2B Dealer discount tier
   */
  async create(data: TNewDealerTier): Promise<TDealerTier> {
    const [newTier] = await this.db
      .insert(dealerTiers)
      .values(data)
      .returning();
    if (!newTier) {
      throw new Error("Failed to create dealer tier");
    }
    return newTier;
  }

  /**
   * Update fields of an existing B2B Dealer Tier
   */
  async update(id: string, data: Partial<TNewDealerTier>): Promise<TDealerTier | undefined> {
    const [updated] = await this.db
      .update(dealerTiers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dealerTiers.id, id))
      .returning();
    return updated;
  }

  /**
   * Fetch all B2B Dealer Tiers ordered by minimum spend threshold
   */
  async getAll(): Promise<TDealerTier[]> {
    return await this.db.query.dealerTiers.findMany({
      orderBy: {
        minimumSpend: "asc",
      },
    });
  }

  /**
   * Fetch a single B2B Dealer Tier by ID
   */
  async getById(id: string): Promise<TDealerTier | undefined> {
    return await this.db.query.dealerTiers.findFirst({
      where: {
        id,
      },
    });
  }

  /**
   * Delete a B2B Dealer Tier from the database
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(dealerTiers)
      .where(eq(dealerTiers.id, id))
      .returning({ id: dealerTiers.id });
    return !!deleted;
  }
}
