import { QUEUE_NAMES } from "@/common/constants/queue.constants";

export const BOOKING_QUEUES = {
  BOOKING: QUEUE_NAMES.BOOKING,
} as const;

export const BOOKING_JOBS = {
  CANCEL_BOOKING: "cancel-booking",
  PAYMENT_RECONCILIATION: "payment-reconciliation",
} as const;

export const BOOKING_CONFIG = {
  IDEMPOTENCY_TTL_SECONDS: 60,
  CANCEL_JOB_DELAY_MS: 600000, // 10 minutes
} as const;

export const REDIS_KEYS = {
  bookingIdempotency: (userId: string, key: string) =>
    `idempotency:booking:${userId}:${key}`,
  confirmIdempotency: (userId: string, key: string) =>
    `idempotency:confirm:${userId}:${key}`,
  showSeatLock: (seatId: string) => `lock:show_seat:${seatId}`,
  cancelBookingJobId: (bookingId: string) => `cancel-booking-${bookingId}`,
} as const;
