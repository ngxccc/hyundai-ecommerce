import type { DrizzleDB } from "@/database/database.module";
import {
  dealerTiers,
  type DealerTier,
  type NewDealerTier,
} from "@/database/schemas";

export async function createDealerTier(
  db: DrizzleDB,
  overrides: Partial<NewDealerTier> = {},
): Promise<DealerTier> {
  const uid = crypto.randomUUID().slice(0, 8);

  const [tier] = await db
    .insert(dealerTiers)
    .values({
      nameVi: `Hạng Đại lý ${uid}`,
      nameEn: `Tier ${uid}`,
      discountPercentage: "10.00",
      minimumSpend: "100000000.00",
      ...overrides,
    })
    .returning();

  if (!tier) {
    throw new Error("Failed to create DealerTier entity in test factory");
  }
  return tier;
}
