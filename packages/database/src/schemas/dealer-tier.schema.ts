import { numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const dealerTiers = pgTable("dealer_tier", {
  ...baseEntity,
  name: text().notNull().unique(),
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

export type DealerTier = typeof dealerTiers.$inferSelect;
export type NewDealerTier = typeof dealerTiers.$inferInsert;
