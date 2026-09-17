/**
 * Time duration constants in seconds and milliseconds.
 * Eliminates magic numbers in cookie maxAge, cache TTL, and date calculations.
 */
export const TIME_IN_SECONDS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
} as const;

export const TIME_IN_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 3600 * 1000,
  DAY: 86400 * 1000,
  WEEK: 604800 * 1000,
  MONTH: 2592000 * 1000,
} as const;
