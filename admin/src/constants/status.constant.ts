import type { components } from "@/types/api-schema";

type ApiSchemas = components["schemas"];

export type QuoteStatus = ApiSchemas["AdminQuoteResponseDto"]["status"];
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

/**
 * Shared status badge styling classes complying with 60-30-10 neutral flat design.
 */
export const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "border-border/80 bg-muted/40 text-foreground",
  PROCESSING: "border-border/80 bg-muted/40 text-foreground",
  SHIPPED: "border-border/80 bg-muted/40 text-foreground",
  DELIVERED: "border-border/80 bg-muted/40 text-foreground",
  COMPLETED: "border-border/80 bg-muted/40 text-foreground",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
  REFUNDED: "border-destructive/30 bg-destructive/10 text-destructive",
  DRAFT: "border-border/80 bg-muted/40 text-foreground",
  SUBMITTED: "border-border/80 bg-muted/40 text-foreground",
  NEGOTIATING: "border-border/80 bg-muted/40 text-foreground",
  APPROVED: "border-border/80 bg-muted/40 text-foreground",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
  EXPIRED: "border-muted text-muted-foreground",
};

export function getStatusBadgeClass(status?: string | null): string {
  if (!status) return "border-border/80 bg-muted/40 text-foreground";
  return (
    STATUS_BADGE_CLASSES[status.toUpperCase()] ??
    "border-border/80 bg-muted/40 text-foreground"
  );
}
