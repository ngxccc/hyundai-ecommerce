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
import type { ProductSpecs } from "@nhatnang/shared/types";
import { sql } from "drizzle-orm";
import { fullEntity } from "./helpers.schema";
import { brands } from "./brand.schema";
import { categories } from "./category.schema";

export const products = snakeCase.table(
  "product",
  {
    ...fullEntity,
    name: text().notNull(),
    slug: text().notNull(),
    price: numeric({ precision: 15, scale: 2 }).notNull(),
    description: text(),
    shortDescription: text(),
    images: text().array().default([]).notNull(),
    brandId: uuid().references(() => brands.id, { onDelete: "set null" }),
    categoryId: uuid().references(() => categories.id, {
      onDelete: "set null",
    }),
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

    index("product_brand_idx").on(table.brandId),
    index("product_category_idx").on(table.categoryId),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
