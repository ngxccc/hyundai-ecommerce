export const QUOTE_ROUTES = {
  TAG: "Quotes",
  ROOT: "quotes",
  ADMIN: "admin",
  BY_ID: ":id",
  STATUS: ":id/status",
  MESSAGES: ":id/messages",
  ITEM_PRICE: ":id/items/:itemId/price",
  EXPORT_EXCEL: ":id/export-excel",
  APPROVE_TO_ORDER: ":id/approve-to-order",
} as const;
