/**
 * Analytics Redis caching configurations and key builders.
 */
export const ANALYTICS_CACHE = {
  /** Cache time-to-live in seconds (60 seconds) */
  TTL_SECONDS: 60,
  /** Root namespace prefix for analytics cache keys */
  PREFIX: "analytics:dashboard",
} as const;

/**
 * Builds the canonical Redis cache key for dashboard analytics partitioned by year and locale.
 *
 * @param year - Target calendar year
 * @param locale - Target content language code (defaults to "vi")
 * @returns Redis cache key string
 */
export const buildAnalyticsCacheKey = (year: number, locale = "vi"): string =>
  `${ANALYTICS_CACHE.PREFIX}:${String(year)}:${locale}`;

/**
 * Calculates start and end timestamps for a calendar year in UTC.
 *
 * @param year - Target calendar year
 * @returns Object with UTC start and end Date boundaries
 */
export const getYearBounds = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
  end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
});

/**
 * Safely parses any database scalar value (string, number, null, undefined) to a non-NaN number.
 *
 * @param value - Scalar value from database driver or mock
 * @returns Non-NaN number defaulting to 0
 */
export const toSafeNumber = (value: unknown): number => Number(value) || 0;

/**
 * Calculates the percentage growth rate between current and previous periods rounded to 1 decimal place.
 *
 * @param current - Current period metric value
 * @param previous - Previous period baseline metric value
 * @returns Percentage growth rate or 0 if previous value is non-positive
 */
export const calcGrowth = (current: number, previous: number): number =>
  previous > 0
    ? Number((((current - previous) / previous) * 100).toFixed(1))
    : 0;
