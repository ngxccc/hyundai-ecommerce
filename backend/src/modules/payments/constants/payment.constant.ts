/**
 * PayOS standard response and webhook status codes.
 */
export const PAYOS_RESPONSE_CODE = {
  /** Transaction processed successfully */
  SUCCESS: "00",
} as const;

export type PayOSResponseCode =
  (typeof PAYOS_RESPONSE_CODE)[keyof typeof PAYOS_RESPONSE_CODE];

/**
 * PayOS API and Hosted Checkout endpoint URLs.
 */
export const PAYOS_ENDPOINTS = {
  /** PayOS Merchant API v2 base URL */
  MERCHANT_API_V2: "https://api-merchant.payos.vn/v2",
  /** PayOS Payment Requests creation endpoint */
  PAYMENT_REQUESTS: "https://api-merchant.payos.vn/v2/payment-requests",
  /** PayOS Hosted Checkout Web Base URL */
  CHECKOUT_WEB_BASE: "https://pay.payos.vn/web",
} as const;

/**
 * Builds a PayOS hosted checkout URL for an order code.
 *
 * @param orderCode - PayOS numeric order code.
 * @returns Fully qualified PayOS checkout URL.
 */
export function buildPayOSCheckoutUrl(orderCode: number | string): string {
  return `${PAYOS_ENDPOINTS.CHECKOUT_WEB_BASE}/${orderCode.toString()}`;
}

/**
 * Builds a simulated VietQR payload for offline or mock gateway execution.
 *
 * @param orderCode - PayOS numeric order code.
 * @returns Simulated VietQR standard string.
 */
export function buildSimulatedVietQR(orderCode: number | string): string {
  return `00020101021238540010A00000072701260006970422${orderCode.toString()}`;
}

/**
 * Distributed lock constants for concurrent payment webhook processing.
 */
export const PAYMENT_LOCK = {
  TTL_MS: 5000,
  PREFIX: "lock:payment:orderCode",
} as const;

/**
 * Builds a standardized Redis distributed lock key for payment webhook processing.
 *
 * @param orderCode - PayOS numeric order code.
 * @returns Redis lock key string.
 */
export function buildPaymentLockKey(orderCode: number | string): string {
  return `${PAYMENT_LOCK.PREFIX}:${orderCode.toString()}`;
}
