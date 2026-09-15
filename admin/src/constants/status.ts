import type { components } from "@/types/api-schema";

type ApiSchemas = components["schemas"];

export type QuoteStatus = ApiSchemas["QuoteResponseDto"]["status"];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

export const QUOTE_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  NEGOTIATING: "NEGOTIATING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const satisfies Record<string, QuoteStatus>;

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, OrderStatus>;

export const orderStatusEnum = {
  enumValues: [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const,
} as const;

export const quoteStatusEnum = {
  enumValues: [
    "DRAFT",
    "SUBMITTED",
    "NEGOTIATING",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
  ] as const,
} as const;
