import { pgEnum } from "drizzle-orm/pg-core";

// 1. User & Authentication Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "staff"]);
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending_verification",
]);

// 2. Movie Catalog Enums
export const movieRatingEnum = pgEnum("movie_rating", [
  "G",
  "PG",
  "PG_13",
  "R",
  "NC_17",
]);

// 3. Showtime & Seat Status Enums
export const showSeatStatusEnum = pgEnum("show_seat_status", [
  "available",
  "reserved",
  "booked",
]);

export type ShowSeatStatus = (typeof showSeatStatusEnum.enumValues)[number];

// 4. Booking & Order Enums
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "cancelled",
  "expired",
]);

export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "flat"]);

// 5. Payment Enums
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
  "requires_refund",
]);

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export const paymentMethodEnum = pgEnum("payment_method", [
  "MOMO",
  "VNPAY",
  "Credit_Card",
  "ShopeePay",
  "PAYOS",
]);

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const outboxEventStatusEnum = pgEnum("outbox_event_status", [
  "pending",
  "processed",
  "failed",
]);

export type OutboxEventStatus =
  (typeof outboxEventStatusEnum.enumValues)[number];
