import { TIME_IN_MS } from "@/common/constants/time.constant";

const timezoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Parse a duration string (e.g., "7d", "15m", "2h", "30s") and return its equivalent in milliseconds.
 * @param duration The duration string
 * @param defaultMs Default milliseconds to return if parsing fails (defaults to 7 days)
 */
export function parseDuration(
  duration: string,
  defaultMs = 7 * TIME_IN_MS.DAY,
): number {
  const value = parseInt(duration, 10);
  const unit = duration.slice(-1);

  if (isNaN(value)) {
    return defaultMs;
  }

  switch (unit) {
    case "d":
      return value * TIME_IN_MS.DAY;
    case "h":
      return value * TIME_IN_MS.HOUR;
    case "m":
      return value * TIME_IN_MS.MINUTE;
    case "s":
      return value * TIME_IN_MS.SECOND;
    default:
      return defaultMs;
  }
}

/**
 * Calculate an expiration Date object from a duration string.
 * @param duration The duration string (e.g., "7d", "15m")
 */
export function getExpiryDate(duration: string): Date {
  return new Date(Date.now() + parseDuration(duration));
}

/**
 * Calculate a past Date object from a duration string (e.g., "7d", "15m").
 * @param duration The duration string
 */
export function getPastDate(duration: string): Date {
  return new Date(Date.now() - parseDuration(duration));
}

/**
 * Convert minutes to equivalent milliseconds.
 * @param minutes Number of minutes
 */
export function minutesToMs(minutes: number): number {
  return minutes * TIME_IN_MS.MINUTE;
}

/**
 * Convert days to equivalent milliseconds.
 * @param days Number of days
 */
export function daysToMs(days: number): number {
  return days * TIME_IN_MS.DAY;
}

/**
 * Extracts numerical calendar date parts ({ year, month, day }) in a target IANA timezone.
 * Uses cached Intl.DateTimeFormat instances to eliminate object allocation overhead on repeated calls.
 *
 * @param date - Source Date instance (defaults to new Date())
 * @param timeZone - Target IANA timezone identifier (defaults to "Asia/Ho_Chi_Minh")
 * @returns Object containing numerical { year, month, day } where month is 1-indexed (1..12)
 */
export function getTimezoneDateParts(
  date: Date = new Date(),
  timeZone = "Asia/Ho_Chi_Minh",
): { year: number; month: number; day: number } {
  let formatter = timezoneFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    timezoneFormatterCache.set(timeZone, formatter);
  }

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return { year, month, day };
}

/**
 * Formats a Date instance as a YYYY-MM-DD calendar date string in a specified target IANA timezone.
 *
 * @param date Source Date instance (defaults to new Date())
 * @param timeZone Target IANA timezone identifier (defaults to "Asia/Ho_Chi_Minh")
 * @returns Formatted YYYY-MM-DD calendar date string
 */
export function formatTimezoneDate(
  date: Date = new Date(),
  timeZone = "Asia/Ho_Chi_Minh",
): string {
  const { year, month, day } = getTimezoneDateParts(date, timeZone);
  return `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Calculates a future calendar date string (YYYY-MM-DD) within an allowed forward day horizon in a target timezone.
 *
 * @param days Number of forward calendar days to add
 * @param timeZone Target IANA timezone identifier (defaults to "Asia/Ho_Chi_Minh")
 * @returns Formatted YYYY-MM-DD calendar date string
 */
export function getFutureTimezoneDate(
  days: number,
  timeZone = "Asia/Ho_Chi_Minh",
): string {
  const futureDate = new Date(Date.now() + days * TIME_IN_MS.DAY);
  return formatTimezoneDate(futureDate, timeZone);
}

/**
 * Calculates the exact UTC Date range [startUtc, endUtc] corresponding to a full calendar day in a target IANA timezone.
 *
 * @param dateStr ISO YYYY-MM-DD calendar date string
 * @param timeZone Target IANA timezone identifier (defaults to "Asia/Ho_Chi_Minh")
 * @returns Object containing startUtc (00:00:00.000 local) and endUtc (23:59:59.999 local)
 */
export function getTimezoneDayRange(
  dateStr: string,
  timeZone = "Asia/Ho_Chi_Minh",
): { startUtc: Date; endUtc: Date } {
  if (timeZone === "Asia/Ho_Chi_Minh") {
    const startUtc = new Date(`${dateStr}T00:00:00.000+07:00`);
    const endUtc = new Date(`${dateStr}T23:59:59.999+07:00`);
    return { startUtc, endUtc };
  }

  const parts = dateStr.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return { startUtc, endUtc };
}
