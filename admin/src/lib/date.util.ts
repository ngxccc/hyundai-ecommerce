import { TIME_IN_SECONDS, TIME_IN_MS } from "@/constants/time.constant";

/**
 * Parse a duration string (e.g. "30d", "7d", "24h", "15m", "60s") into seconds.
 * @param duration Duration string format
 * @param defaultSeconds Fallback in seconds if parsing fails (defaults to 1 day / 86400s)
 */
export function parseDurationToSeconds(
  duration: string,
  defaultSeconds: number = TIME_IN_SECONDS.DAY,
): number {
  const value = parseInt(duration, 10);
  const unit = duration.slice(-1);

  if (Number.isNaN(value)) {
    return defaultSeconds;
  }

  switch (unit) {
    case "s":
      return value * TIME_IN_SECONDS.SECOND;
    case "m":
      return value * TIME_IN_SECONDS.MINUTE;
    case "h":
      return value * TIME_IN_SECONDS.HOUR;
    case "d":
      return value * TIME_IN_SECONDS.DAY;
    case "w":
      return value * TIME_IN_SECONDS.WEEK;
    case "M":
      return value * TIME_IN_SECONDS.MONTH;
    default:
      return value;
  }
}

/**
 * Parse a duration string (e.g. "30d", "15m") into milliseconds.
 */
export function parseDurationToMs(
  duration: string,
  defaultMs: number = TIME_IN_MS.DAY,
): number {
  return parseDurationToSeconds(duration, defaultMs / 1000) * 1000;
}
