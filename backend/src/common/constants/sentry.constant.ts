/**
 * Standardized Sentry Breadcrumb Categories.
 * Single Source of Truth (SSOT) to ensure consistent log categorization and dashboard filtering.
 */
export const SENTRY_BREADCRUMB_CATEGORY = {
  HTTP: "http",
  HTTP_CLIENT_ERROR: "http.client_error",
  DB_QUERY: "db.query",
  REDLOCK: "redlock",
  AUTH: "auth",
  MAIL: "mail",
  OUTBOX: "outbox",
} as const;

export type SentryBreadcrumbCategory =
  | (typeof SENTRY_BREADCRUMB_CATEGORY)[keyof typeof SENTRY_BREADCRUMB_CATEGORY]
  | (string & {});
