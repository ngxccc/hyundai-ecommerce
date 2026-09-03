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

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type BrandDTO = Omit<Brand, "createdAt" | "updatedAt" | "deletedAt">;
export type BrandAdminDTO = Omit<Brand, "deletedAt">;
