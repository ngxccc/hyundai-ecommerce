export const HTTP_HEADERS = {
  IDEMPOTENCY_KEY: "idempotency-key",
} as const;

export type HttpHeader = (typeof HTTP_HEADERS)[keyof typeof HTTP_HEADERS];
