import { LoginDto } from "@/modules/auth/dto/login.dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { CreateShowDto } from "@/modules/shows/dto/create-show.dto";
import { CreateShowBatchDto } from "@/modules/shows/dto/create-show-batch.dto";
import { ReserveSeatsDto } from "@/modules/booking/dto/reserve-seats.dto";
import { ConfirmBookingDto } from "@/modules/booking/dto/confirm-booking.dto";
import { PayOSWebhookDto } from "@/modules/booking/dto/payos-webhook.dto";
import { measureBenchmark, type BenchmarkMetric } from "./benchmark.util";

export function runBenchmark(): BenchmarkMetric[] {
  const ITERATIONS = 10000;
  const WARMUP = 1000;

  // 1. Small DTO (Login)
  const loginPayload = {
    email: "user@example.com",
    password: "Password123!",
  };

  // 2. Medium DTO (Register)
  const registerPayload = {
    email: "user@example.com",
    fullName: "John Doe",
    phoneNumber: "0912345678",
    password: "Password123!",
    confirmPassword: "Password123!",
    agreeTerms: true,
  };

  // 3. Single Show DTO
  const createShowPayload = {
    movieId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    hallId: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    startTime: "2026-09-01T10:00:00.000Z",
    basePrice: 100000,
  };

  // 4. Batch Shows DTO
  const createShowBatchPayload = {
    movieId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    hallId: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    timeSlots: ["10:00", "14:30", "19:00"],
    basePrice: 100000,
  };

  // 5. Reserve Seats DTO
  const reserveSeatsPayload = {
    showId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    seatIds: [
      "019fa8bc-8f4d-7000-b366-e691f45cfb01",
      "019fa8bc-8f4d-7000-b366-e691f45cfb02",
      "019fa8bc-8f4d-7000-b366-e691f45cfb03",
    ],
    voucherCode: "DISCOUNT50",
  };

  // 6. Confirm Booking DTO
  const confirmBookingPayload = {
    bookingId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    orderCode: 123456,
    paymentMethod: "PAYOS",
    transactionId: "TXN-123456789",
    amount: 200000,
  };

  // 7. PayOS Webhook DTO
  const payOSWebhookPayload = {
    code: "00",
    desc: "success",
    data: {
      orderCode: 123456,
      amount: 200000,
      description: "Payment for order 123456",
      accountNumber: "1234567890",
      reference: "FT2401019999",
      transactionDateTime: "2026-08-30 10:00:00",
      currency: "VND",
      paymentLinkId: "plink_123456",
      code: "00",
      desc: "success",
    },
    signature:
      "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  };

  // 8. Invalid Payload Error Path (Register with 5 violations)
  const invalidRegisterPayload = {
    email: "not-an-email",
    fullName: "",
    phoneNumber: "0123456789",
    password: "weak",
    confirmPassword: "mismatched",
    agreeTerms: false,
  };

  return [
    measureBenchmark(
      "Auth: LoginDto (Small DTO Valid)",
      () => {
        const res = LoginDto.zodSchema.safeParse(loginPayload);
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Auth: RegisterDto (Medium DTO Valid)",
      () => {
        const res = RegisterDto.zodSchema.safeParse(registerPayload);
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Shows: CreateShowDto (Single Show Valid)",
      () => {
        const res = CreateShowDto.zodSchema.safeParse(createShowPayload);
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Shows: CreateShowBatchDto (Batch Shows Valid)",
      () => {
        const res = CreateShowBatchDto.zodSchema.safeParse(
          createShowBatchPayload,
        );
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Booking: ReserveSeatsDto (Seat Array Valid)",
      () => {
        const res = ReserveSeatsDto.zodSchema.safeParse(reserveSeatsPayload);
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Booking: ConfirmBookingDto (Payment Valid)",
      () => {
        const res = ConfirmBookingDto.zodSchema.safeParse(
          confirmBookingPayload,
        );
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Booking: PayOSWebhookDto (Nested Payload Valid)",
      () => {
        const res = PayOSWebhookDto.zodSchema.safeParse(payOSWebhookPayload);
        if (!res.success) throw new Error("Validation failed");
      },
      ITERATIONS,
      WARMUP,
    ),
    measureBenchmark(
      "Error Path: RegisterDto (5 Violations Error Path)",
      () => {
        const res = RegisterDto.zodSchema.safeParse(invalidRegisterPayload);
        if (res.success) throw new Error("Expected validation failure");
      },
      ITERATIONS,
      WARMUP,
    ),
  ];
}

export default runBenchmark;
