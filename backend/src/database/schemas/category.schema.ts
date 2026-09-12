import {
  boolean,
  index,
  primaryKey,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const categories = snakeCase.table(
  "category",
  {
    ...baseEntity,
    nameVi: text().notNull(),
    nameEn: text(),
    slug: text().notNull(),
    parentId: uuid().references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    descriptionVi: text(),
    descriptionEn: text(),
    image: text(),
    isActive: boolean().default(true).notNull(),
  },
  (table) => [
    uniqueIndex("category_slug_uidx").on(table.slug),
    index("category_parent_id_idx").on(table.parentId),
    index("category_is_active_idx").on(table.isActive),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const categoryTranslations = snakeCase.table(
  "category_translation",
  {
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: varchar({ length: 8 }).notNull(),
    name: text().notNull(),
    description: text(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.locale] }),
    index("category_translation_category_locale_idx").on(
      table.categoryId,
      table.locale,
    ),
  ],
);

export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type NewCategoryTranslation = typeof categoryTranslations.$inferInsert;
