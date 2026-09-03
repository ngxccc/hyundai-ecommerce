import { env } from "@/env";

export const SHOWS_CONSTANTS = {
  /** Minimum buffer time between consecutive shows for cleaning (minutes) */
  CLEANING_BUFFER_MINUTES: 15,
  /** Minimum lead time from now() for show creation (minutes, configurable via SHOW_CREATION_MIN_LEAD_MINUTES) */
  MIN_LEAD_TIME_MINUTES: env.SHOW_CREATION_MIN_LEAD_MINUTES,
  /** Maximum date range span for batch show creation (days) */
  MAX_BATCH_DAYS: 30,
  /** Maximum distinct time slots allowed per day */
  MAX_SLOTS_PER_DAY: 10,
  /** Maximum total shows generated in a single batch request */
  MAX_BATCH_SHOWS: 100,
  /** 24-hour time format HH:mm regex */
  TIME_SLOT_REGEX: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  /** Default cinema operational timezone */
  DEFAULT_TIMEZONE: "Asia/Ho_Chi_Minh",
  /** ISO timezone offset string for default operational timezone */
  TIMEZONE_OFFSET: "+07:00",
  /** Chunk size for bulk inserting show_seats records */
  SEAT_PREALLOCATION_CHUNK_SIZE: 1000,
} as const;
