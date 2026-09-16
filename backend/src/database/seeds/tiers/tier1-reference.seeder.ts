import type { DrizzleDB } from "@/database/database.module";
import { dealerTiers, users } from "@/database/schemas";
import {
  getSeedPasswordHash,
  isScopeActive,
  type SeedScope,
} from "../constants/seed.constant";
import type {
  Tier1SeedResult,
  DealerTierFixtureData,
  UserFixtureData,
} from "../types/seed.type";
import dealerTiersFixture from "../fixtures/reference/dealer-tiers.json";
import usersFixture from "../fixtures/reference/users.json";

export async function seedTier1Reference(
  db: DrizzleDB,
  scopes: SeedScope[],
): Promise<Tier1SeedResult> {
  const result: Tier1SeedResult = {
    dealerTiers: [],
    users: [],
  };

  // 1. Seed Dealer Tiers
  if (isScopeActive(scopes, "reference", "dealer-tiers")) {
    const tierData: DealerTierFixtureData[] = dealerTiersFixture;
    await db.insert(dealerTiers).values(tierData).onConflictDoNothing();

    result.dealerTiers = await db
      .select({
        id: dealerTiers.id,
        nameVi: dealerTiers.nameVi,
        nameEn: dealerTiers.nameEn,
        discountPercentage: dealerTiers.discountPercentage,
      })
      .from(dealerTiers);
  }

  // 2. Seed Users
  if (isScopeActive(scopes, "reference", "users")) {
    const passwordHash = await getSeedPasswordHash();

    const rawUsers = usersFixture as unknown as UserFixtureData[];
    const userData = rawUsers.map((u) => ({
      ...u,
      passwordHash,
    }));
    await db.insert(users).values(userData).onConflictDoNothing();

    result.users = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        dealerTierId: users.dealerTierId,
        creditLimit: users.creditLimit,
      })
      .from(users);
  }

  return result;
}
