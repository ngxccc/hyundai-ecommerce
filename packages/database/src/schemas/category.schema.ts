import {
  boolean,
  pgTable,
  text,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const categories = pgTable("category", {
  ...baseEntity,
  name: text().notNull(),
  slug: text().notNull().unique(),
  parentId: uuid().references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
  }),
  description: text(),
  image: text(),
  isActive: boolean().default(true).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
