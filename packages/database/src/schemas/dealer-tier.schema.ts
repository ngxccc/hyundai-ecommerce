import { relations } from "drizzle-orm";
import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { v7 as uuidv7 } from "uuid";

export const dealerTiers = pgTable("dealer_tier", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  name: text("name").notNull().unique(),
  discountPercentage: numeric("discount_percentage", {
    precision: 5,
    scale: 2,
  }).notNull(),
  minimumSpend: numeric("minimum_spend", {
    precision: 15,
    scale: 2,
  })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const dealerTierRelations = relations(dealerTiers, ({ many }) => ({
  users: many(users),
}));
