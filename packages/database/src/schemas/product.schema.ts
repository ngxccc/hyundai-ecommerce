import {
  pgTable,
  text,
  jsonb,
  integer,
  boolean,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ProductSpecs } from "@nhatnang/types";
import { sql } from "drizzle-orm";
import { fullEntity } from "./helpers.schema";

export const products = pgTable(
  "product",
  {
    ...fullEntity,
    name: text().notNull(),
    slug: text().notNull(),
    price: numeric({ precision: 15, scale: 2 }).notNull(),
    description: text(),
    shortDescription: text(),
    images: text().array().default([]).notNull(),
    brand: text().notNull(),
    specs: jsonb().$type<ProductSpecs>().default({}),
    totalStockCache: integer().notNull().default(0),
    isQuoteOnly: boolean().notNull().default(false),
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
