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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import type { ProductSpecs } from "@nhatnang/types";
import { sql } from "drizzle-orm";

export const products = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
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
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("product_slug_active_idx")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),

    index("product_name_active_idx")
      .on(table.name)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
