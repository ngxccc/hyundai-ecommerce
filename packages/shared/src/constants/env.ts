export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const isProduction =
  process.env.NODE_ENV === ENVIRONMENT_MODES.PRODUCTION;
