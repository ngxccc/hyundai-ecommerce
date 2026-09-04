export const ORDER_ROUTES = {
  TAG: "Orders",
  ROOT: "orders",
  CHECKOUT: "checkout",
  ADMIN: "admin",
  BY_ID: ":id",
  STATUS: ":id/status",
  CANCEL: ":id/cancel",
  EXPIRE_CRON: "cron/expire",
} as const;
