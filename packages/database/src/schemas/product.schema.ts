import {
  snakeCase,
  text,
  jsonb,
  integer,
  boolean,
  numeric,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { JSONContent } from "@tiptap/core";
import { sql } from "drizzle-orm";
import { fullEntity } from "./helpers.schema";
import { brands } from "./brand.schema";
import { categories } from "./category.schema";
import type { TProductSpecs } from "../validators";

export const products = snakeCase.table(
  "product",
  {
    ...fullEntity,
    nameVi: text().notNull(),
    nameEn: text(),
    slug: text().notNull(),
    price: numeric({ precision: 15, scale: 2 }).notNull(),
    descriptionVi: jsonb().$type<JSONContent>(),
    descriptionEn: jsonb().$type<JSONContent>(),
    shortDescriptionVi: text(),
    shortDescriptionEn: text(),
    images: text().array().default([]).notNull(),
    brandId: uuid().references(() => brands.id, { onDelete: "set null" }),
    categoryId: uuid().references(() => categories.id, {
      onDelete: "set null",
    }),
    specs: jsonb().$type<TProductSpecs>().default({}),
    totalStockCache: integer().notNull().default(0),
    totalSalesCache: integer().notNull().default(0),
    isQuoteOnly: boolean().notNull().default(false),
  },
  (table) => [
    uniqueIndex("product_slug_active_idx")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),

    index("product_name_active_idx")
      .on(table.nameVi)
      .where(sql`${table.deletedAt} IS NULL`),

    index("product_brand_idx").on(table.brandId),
    index("product_category_idx").on(table.categoryId),
    index("product_sales_cache_idx").on(table.totalSalesCache),
    index("product_created_at_idx").on(table.createdAt),

    index("product_power_idx").on(
      sql`(CASE WHEN ${table.specs}->>'power' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'power')::numeric ELSE NULL END)`,
    ),
    index("product_voltage_idx").on(
      sql`(CASE WHEN ${table.specs}->>'voltage' ~ '^\\s*\\d+(\\.\\d+)?\\s*$' THEN (${table.specs}->>'voltage')::numeric ELSE NULL END)`,
    ),
  ],
);

export type TProduct = typeof products.$inferSelect;
export type TNewProduct = typeof products.$inferInsert;
