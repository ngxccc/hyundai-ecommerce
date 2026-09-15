export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const MESSAGES = {
  NEXT_URL_IS_INVALID: "NEXT_PUBLIC_APP_URL is invalid",
} as const;

export const FINANCIAL_CONSTANTS = {
  VAT_RATE: 0.1,
  DEPOSIT_RATE: 0.2,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
