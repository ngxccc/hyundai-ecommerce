import { boolean, snakeCase, text } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const brands = snakeCase.table("brand", {
  ...baseEntity,
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  logo: text(),
  descriptionVi: text(),
  descriptionEn: text(),
  isActive: boolean().default(true).notNull(),
});

export type TBrand = typeof brands.$inferSelect;
export type TNewBrand = typeof brands.$inferInsert;
