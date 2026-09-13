/**
 * Legacy retail payment and PayOS routes, dormant after transition to B2B RFQ model.
 */
export const PAYMENT_ROUTES = {
  TAG: "payments (deprecated)",
  ROOT: "payments",
  CHECKOUT_LINK: "checkout-link",
  PAYOS_WEBHOOK: "payos-webhook",
  VERIFY_CASH: ":id/verify-cash",
  REPAY_DEBT: "repay-debt",
  BY_ORDER_ID: "order/:orderId",
} as const;
