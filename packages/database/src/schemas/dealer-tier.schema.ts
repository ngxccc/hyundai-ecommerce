import { numeric, snakeCase, text } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const dealerTiers = snakeCase.table("dealer_tier", {
  ...baseEntity,
  nameVi: text().notNull().unique(),
  nameEn: text(),
  discountPercentage: numeric({
    precision: 5,
    scale: 2,
  }).notNull(),
  minimumSpend: numeric({
    precision: 15,
    scale: 2,
  })
    .notNull()
    .default("0"),
});

export type TDealerTier = typeof dealerTiers.$inferSelect;
export type TNewDealerTier = typeof dealerTiers.$inferInsert;
