import type { DrizzleDB } from "@/database/database.module";
import { createDealerTier } from "../factories/dealer-tier.factory";
import type { DealerTier } from "@/database/schemas";

export const DealerTierMother = {
  silver(db: DrizzleDB): Promise<DealerTier> {
    return createDealerTier(db, {
      nameVi: "Đại lý Bạc",
      nameEn: "Silver Dealer",
      discountPercentage: "10.00",
      minimumSpend: "10000000.00",
    });
  },

  gold(db: DrizzleDB): Promise<DealerTier> {
    return createDealerTier(db, {
      nameVi: "Đại lý Vàng",
      nameEn: "Gold Dealer",
      discountPercentage: "15.00",
      minimumSpend: "50000000.00",
    });
  },

  platinum(db: DrizzleDB): Promise<DealerTier> {
    return createDealerTier(db, {
      nameVi: "Đại lý Bạch Kim",
      nameEn: "Platinum Dealer",
      discountPercentage: "20.00",
      minimumSpend: "100000000.00",
    });
  },
} as const;
