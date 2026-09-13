export const ORDER_ROUTES = {
  TAG: "orders",
  ROOT: "orders",
  CHECKOUT: "checkout",
  ADMIN: "admin",
  BY_ID: ":id",
  STATUS: ":id/status",
  CANCEL: ":id/cancel",
  VERIFY_CASH: ":id/verify-cash",
  EXPIRE_CRON: "cron/expire",
} as const;
