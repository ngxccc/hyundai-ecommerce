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
  "SEND_ZALO_ZNS",
  "SEND_TELEGRAM_ALERT",
]);

export const outboxEventStatusEnum = pgEnum("outbox_event_status", [
  "PENDING",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
]);

export interface SendQuoteEmailPayload {
  orderId: string;
  customerEmail: string;
  pdfUrl?: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface SendZaloZNSPayload {
  phone: string;
  templateId: string;
  templateData: Record<string, unknown>;
}

export interface SendTelegramAlertPayload {
  channelId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export type OutboxPayload =
  | SendQuoteEmailPayload
  | SendEmailPayload
  | SendZaloZNSPayload
  | SendTelegramAlertPayload;

export const outboxEvents = snakeCase.table("outbox_event", {
  ...baseEntity,
  eventType: eventTypeEnum().notNull(),
  payload: jsonb().$type<OutboxPayload>().notNull(),
  status: outboxEventStatusEnum().default("PENDING").notNull(),
  retryCount: integer().default(0).notNull(),
  lastError: text(),
  processedAt: timestamp({ withTimezone: true, mode: "date" }),
});

export type TOutboxEvent = typeof outboxEvents.$inferSelect;
export type TNewOutboxEvent = typeof outboxEvents.$inferInsert;
export type OutboxEventStatus =
  (typeof outboxEventStatusEnum.enumValues)[number];
