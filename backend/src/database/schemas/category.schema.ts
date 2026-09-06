import {
  boolean,
  index,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
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
