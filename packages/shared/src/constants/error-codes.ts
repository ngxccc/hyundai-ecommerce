export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
} as const;

export type TAuthErrorCode = keyof typeof AUTH_ERROR_CODES;
