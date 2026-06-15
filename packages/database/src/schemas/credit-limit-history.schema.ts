import { numeric, snakeCase, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { fullEntity } from "./helpers.schema";

export const creditLimitHistory = snakeCase.table("credit_limit_history", {
  ...fullEntity,
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  oldLimit: numeric({ precision: 15, scale: 2 }).notNull(),
  newLimit: numeric({ precision: 15, scale: 2 }).notNull(),
  changedBy: uuid()
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  reason: text(),
});

export type TCreditLimitHistory = typeof creditLimitHistory.$inferSelect;
export type TNewCreditLimitHistory = typeof creditLimitHistory.$inferInsert;
