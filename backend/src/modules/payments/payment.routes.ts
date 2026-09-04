export const PAYMENT_ROUTES = {
  TAG: "payments",
  ROOT: "payments",
  CHECKOUT_LINK: "checkout-link",
  PAYOS_WEBHOOK: "payos-webhook",
  VERIFY_CASH: ":id/verify-cash",
  REPAY_DEBT: "repay-debt",
  BY_ORDER_ID: "order/:orderId",
} as const;
