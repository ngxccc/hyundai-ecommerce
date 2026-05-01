import {
  integer,
  jsonb,
  pgEnum,
  snakeCase,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const eventTypeEnum = pgEnum("event_type", [
  "SEND_QUOTE_EMAIL",
  "SEND_MAIL",
]);

export const outboxEventStatusEnum = pgEnum("outbox_event_status", [
  "PENDING",
  "PROCESSED",
  "FAILED",
]);

export type SendQuoteEmailPayload = {
  orderId: string;
  customerEmail: string;
  pdfUrl?: string;
};

export type SendEmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export type OutboxPayload = SendQuoteEmailPayload | SendEmailPayload;

export const outboxEvents = snakeCase.table("outbox_event", {
  ...baseEntity,
  eventType: eventTypeEnum().notNull(),
  payload: jsonb().$type<OutboxPayload>().notNull(),
  status: outboxEventStatusEnum().default("PENDING").notNull(),
  retryCount: integer().default(0).notNull(),
  lastError: text(),
  processedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;
