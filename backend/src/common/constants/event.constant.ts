export const OUTBOX_EVENT_TYPE = {
  AUTH_VERIFICATION_EMAIL_REQUESTED: "auth.verification_email_requested",
  AUTH_RESET_PASSWORD_EMAIL_REQUESTED: "auth.reset_password_email_requested",
  BOOKING_CONFIRMED: "booking.confirmed",
} as const;

export type OutboxEventType =
  (typeof OUTBOX_EVENT_TYPE)[keyof typeof OUTBOX_EVENT_TYPE];

export const MAIL_JOB_NAME = {
  SEND_VERIFICATION: "send-verification",
  SEND_RESET_PASSWORD: "send-reset-password",
} as const;

export type MailJobName = (typeof MAIL_JOB_NAME)[keyof typeof MAIL_JOB_NAME];

export const LOG_EVENTS = {
  RECONCILIATION_CHECK: "RECONCILIATION_CHECK",
  PAYMENT_CONFIRMED_SUCCESS: "PAYMENT_CONFIRMED_SUCCESS",
  PAYOS_WEBHOOK_RECEIVED: "PAYOS_WEBHOOK_RECEIVED",
  PAYOS_WEBHOOK_INVALID_SIGNATURE: "PAYOS_WEBHOOK_INVALID_SIGNATURE",
  PAYOS_WEBHOOK_STALE_TIMESTAMP: "PAYOS_WEBHOOK_STALE_TIMESTAMP",
} as const;

export type LogEvent = (typeof LOG_EVENTS)[keyof typeof LOG_EVENTS];
