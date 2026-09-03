export const QUOTE_STATUSES = [
  "pending_review",
  "negotiating",
  "approved",
  "rejected",
  "expired",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
