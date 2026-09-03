/**
 * Time duration constants in milliseconds.
 * Eliminates magic numbers in date calculations and timeout configurations.
 */
export const TIME_IN_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;
