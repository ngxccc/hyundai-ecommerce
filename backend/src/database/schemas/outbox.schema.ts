import {
  index,
  integer,
  jsonb,
  snakeCase,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { outboxEventStatusEnum } from "./enums.schema";
import { primaryKeyUuid } from "./helpers.schema";

export const outboxEvents = snakeCase.table(
  "outbox_events",
  {
    ...primaryKeyUuid,
    createdAt: timestamp({ withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    eventType: varchar({ length: 255 }).notNull(),
    payload: jsonb().notNull(),
    status: outboxEventStatusEnum().default("PENDING").notNull(),
    processedAt: timestamp({ withTimezone: true, mode: "date" }),
    attempts: integer().default(0).notNull(),
    lastError: text(),
  },
  (table) => [
    index("outbox_events_status_created_at_idx").on(
      table.status,
      table.createdAt,
    ),
  ],
);

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;
