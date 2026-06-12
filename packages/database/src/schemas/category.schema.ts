import {
  boolean,
  snakeCase,
  text,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const categories = snakeCase.table("category", {
  ...baseEntity,
  nameVi: text().notNull(),
  nameEn: text(),
  slug: text().notNull().unique(),
  parentId: uuid().references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
  }),
  descriptionVi: text(),
  descriptionEn: text(),
  image: text(),
  isActive: boolean().default(true).notNull(),
});

export type TCategory = typeof categories.$inferSelect;
export type TNewCategory = typeof categories.$inferInsert;
