import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import type { ProductSpecs } from "@nhatnang/types";

export const products = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    price: numeric("price", { precision: 15, scale: 2 }).notNull(),
    specs: jsonb("specs").$type<ProductSpecs>().default({}),
    totalStockCache: integer("total_stock_cache").notNull().default(0),
    isQuoteOnly: boolean("is_quote_only").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("product_slug_idx").on(table.slug)],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
