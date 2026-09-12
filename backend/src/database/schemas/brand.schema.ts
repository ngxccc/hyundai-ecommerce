import {
  boolean,
  index,
  primaryKey,
  snakeCase,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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

export const brandTranslations = snakeCase.table(
  "brand_translation",
  {
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    locale: varchar({ length: 8 }).notNull(),
    description: text(),
  },
  (table) => [
    primaryKey({ columns: [table.brandId, table.locale] }),
    index("brand_translation_brand_locale_idx").on(table.brandId, table.locale),
  ],
);

export type BrandTranslation = typeof brandTranslations.$inferSelect;
export type NewBrandTranslation = typeof brandTranslations.$inferInsert;
