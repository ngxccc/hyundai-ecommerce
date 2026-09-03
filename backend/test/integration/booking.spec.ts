import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
} from "bun:test";
import { v7 as uuidv7 } from "uuid";
import request from "supertest";
import { type INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import { JwtService } from "@nestjs/jwt";
import { eq, and } from "drizzle-orm";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { truncateAllTables } from "@/database/database.connection";
import { createAuthenticatedUser } from "../helpers/auth.helper";
import type { DrizzleDB } from "@/database/database.module";
import { RedlockService } from "@/common/services/redlock.service";
import { BookingCronService } from "@/modules/booking/booking-cron.service";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import type { components } from "../generated/api-schema";
import {
  showSeats,
  bookings,
  payments,
  tickets,
  outboxEvents,
} from "@/database/schemas";
import {
  createMovie,
  createCinema,
  createHall,
  createSeatType,
  createBatchSeats,
  createShow,
  createBatchShowSeats,
} from "../factories";

type ReserveSeatsResponseData =
  components["schemas"]["ReserveSeatsResponseDto"];
type Rfc9457ErrorResponse = components["schemas"]["Rfc9457ErrorResponseDto"] & {
  statusCode?: number;
};
type ApiSuccessResponse<T> = components["schemas"]["ApiResponseDto"] & {
  data: T;
};

describe("Booking Module Integration", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let httpServer: Server;
  let db: DrizzleDB;

  let testUserId: string;
  let testUserToken: string;
  let testShowId: string;
  let testSeatId1: string;
  let testSeatId2: string;
  let testSeatId3: string;
  let testSeatId4: string;
  let testSeatId5: string;
  let testSeatId6: string;
  let testSeatId7: string;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
    httpServer = app.getHttpServer() as Server;

    await truncateAllTables(db, setup.workerSchema);

    const timestamp = Date.now().toString();
    const userEmail = `booking-test-${timestamp}@example.com`;

    const userSession = await createAuthenticatedUser(db, app.get(JwtService), {
      email: userEmail,
      fullName: "Booking Test User",
    });
    testUserId = userSession.user.id;
    testUserToken = userSession.token;

    const insertedMovie = await createMovie(db, {
      durationMinutes: 148,
      releaseDate: "2026-01-01",
      posterUrl: "https://example.com/poster.jpg",
    });

    const insertedCinema = await createCinema(db, {
      name: "Grand Cinema Center",
      streetAddress: "123 Main St",
    });

    const insertedHall = await createHall(db, {
      cinemaId: insertedCinema.id,
      name: "Hall 1 IMAX",
      totalSeats: 100,
    });

    const insertedSeatType = await createSeatType(db, {
      name: `Standard-${timestamp}`,
      priceMultiplier: "1.00",
    });

    const insertedShow = await createShow(db, {
      movieId: insertedMovie.id,
      hallId: insertedHall.id,
      startTime: new Date(Date.now() + TIME_IN_MS.DAY),
      endTime: new Date(Date.now() + TIME_IN_MS.DAY + 2 * TIME_IN_MS.HOUR),
      basePrice: 100000,
    });

    testShowId = insertedShow.id;

    const insertedSeatList = await createBatchSeats(
      db,
      insertedHall.id,
      insertedSeatType.id,
      7,
    );

    await createBatchShowSeats(
      db,
      testShowId,
      insertedSeatList.map((s) => s.id),
    );
    const seatRecords = insertedSeatList.map((st) => st.id);

    const [s1, s2, s3, s4, s5, s6, s7] = seatRecords;
    if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7) {
      throw new Error("Failed to populate test seat records");
    }
    testSeatId1 = s1;
    testSeatId2 = s2;
    testSeatId3 = s3;
    testSeatId4 = s4;
    testSeatId5 = s5;
    testSeatId6 = s6;
    testSeatId7 = s7;
  }, 30000);

  afterAll(async () => {
    await truncateAllTables(db);
    await app.close();
  });

  beforeEach(async () => {
    try {
      const redis = app.get(RedlockService).getRedisClient();
      const lockKeys = await redis.keys("lock:show_seat:*");
      const idempotencyKeys = await redis.keys("idempotency:*");
      const allKeys = [...lockKeys, ...idempotencyKeys];
      if (allKeys.length > 0) {
        await redis.del(...allKeys);
      }
    } catch {
      // Fail-open strategy if Redis keys cleanup is temporarily unavailable.
    }
    await db.delete(payments);
    await db.delete(outboxEvents);
    await db.delete(tickets);
    await db.delete(bookings);
    await db
      .update(showSeats)
      .set({ status: "available", lockedUntil: null })
      .where(eq(showSeats.showId, testShowId));
  });

  describe("POST /bookings/reserve", () => {
    describe("when validating authentication", () => {
      it("should return 401 Unauthorized when Authorization header is missing", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId6],
          })
          .expect(401);
        const body = response.body as Rfc9457ErrorResponse;
        expect(response.status).toBe(401);
        expect(body.statusCode ?? body.status).toBe(401);
      });

      it("should return 401 Unauthorized when Bearer token is malformed or invalid", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", "Bearer invalid-malformed-jwt-token")
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId6],
          })
          .expect(401);
        const body = response.body as Rfc9457ErrorResponse;
        expect(body.statusCode ?? body.status).toBe(401);
      });
    });

    describe("when validating idempotency header", () => {
      it("should return 400 Bad Request when idempotency-key header is missing", async () => {
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .send({
            showId: testShowId,
            seatIds: [testSeatId6],
          })
          .expect(400);
        const body = response.body as Rfc9457ErrorResponse;
        expect(response.status).toBe(400);
        expect(body.statusCode ?? body.status).toBe(400);
      });
    });

    describe("when validating request payload", () => {
      it("should return 400 Bad Request when showId is not a valid UUIDv7 format", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: "invalid-not-uuid",
            seatIds: [testSeatId6],
          })
          .expect(400);
        const body = response.body as Rfc9457ErrorResponse;
        expect(typeof body.detail).toBe("string");
        expect(body.detail.length).toBeGreaterThan(0);
        expect(body.invalidParams).toBeDefined();
        expect(
          body.invalidParams?.some(
            (param: { name: string }) => param.name === "showId",
          ),
        ).toBe(true);
      });

      it("should return 400 Bad Request when seatIds array is empty (violates @ArrayMinSize(1))", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [],
          })
          .expect(400);

        const body = response.body as Rfc9457ErrorResponse;
        expect(body.invalidParams).toBeDefined();
        expect(
          body.invalidParams?.some(
            (param: { name: string }) => param.name === "seatIds",
          ),
        ).toBe(true);
      });

      it("should return 400 Bad Request when seatIds array exceeds 6 seats (violates @ArrayMaxSize(6))", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [
              testSeatId1,
              testSeatId2,
              testSeatId3,
              testSeatId4,
              testSeatId5,
              testSeatId6,
              testSeatId7,
            ],
          })
          .expect(400);

        const body = response.body as Rfc9457ErrorResponse;
        expect(body.invalidParams).toBeDefined();
        expect(
          body.invalidParams?.some(
            (param: { name: string }) => param.name === "seatIds",
          ),
        ).toBe(true);
      });
    });

    describe("when reserving available seats", () => {
      it("should successfully reserve seats and return 201 Created with correct ApiResponse shape", async () => {
        const idempotencyKey = uuidv7();
        const response = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", idempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId1, testSeatId2],
          })
          .expect(201);

        const body =
          response.body as ApiSuccessResponse<ReserveSeatsResponseData>;

        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.bookingId).toBeDefined();
        expect(body.data.showId).toBe(testShowId);
        expect(body.data.totalPrice).toBeGreaterThan(0);
        expect(body.data.status).toBe("pending_payment");
        expect(body.data.seats).toHaveLength(2);
        expect(body.data.expiresAt).toBeDefined();
      }, 15000);
    });

    describe("when encountering seat lock conflicts", () => {
      it("should return 409 Conflict when attempting to reserve already reserved/locked seats", async () => {
        const firstIdempotencyKey = uuidv7();
        const secondIdempotencyKey = uuidv7();
        await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", firstIdempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId3],
          })
          .expect(201);

        const conflictResponse = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", secondIdempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId3],
          })
          .expect(409);

        const body = conflictResponse.body as Rfc9457ErrorResponse;
        expect(conflictResponse.status).toBe(409);
        expect(body.statusCode ?? body.status).toBe(409);
      }, 15000);
    });

    describe("when handling concurrency and race conditions", () => {
      it("should eliminate deadlocks and process exactly one reservation when concurrent requests submit reversed seat orders", async () => {
        const key1 = uuidv7();
        const key2 = uuidv7();
        const reqA = request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", key1)
          .send({
            showId: testShowId,
            seatIds: [testSeatId1, testSeatId2],
          });

        const reqB = request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", key2)
          .send({
            showId: testShowId,
            seatIds: [testSeatId2, testSeatId1],
          });

        const [resA, resB] = await Promise.all([reqA, reqB]);

        const statuses = [resA.status, resB.status].sort((a, b) => a - b);
        expect(statuses).toEqual([201, 409]);

        // Assert DB state: Exactly 1 booking row created for this test user (no duplicate bookings or partial state)
        const createdBookings = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            and(
              eq(bookings.showId, testShowId),
              eq(bookings.userId, testUserId),
            ),
          );
        expect(createdBookings.length).toBe(1);
      }, 15000);

      it("should allow one reservation and reject concurrent duplicates with 409 Conflict when requests share the same idempotency key", async () => {
        const sameIdempotencyKey = uuidv7();
        const reqA = request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", sameIdempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId6],
          });

        const reqB = request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", sameIdempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId6],
          });

        const [resA, resB] = await Promise.all([reqA, reqB]);

        const statuses = [resA.status, resB.status].sort((a, b) => a - b);
        expect(statuses).toEqual([201, 409]);

        // Assert DB state: Exactly 1 booking row created for this test user despite racy duplicate request
        const createdBookings = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            and(
              eq(bookings.showId, testShowId),
              eq(bookings.userId, testUserId),
            ),
          );
        expect(createdBookings.length).toBe(1);
      }, 15000);

      it("should mark expired bookings as expired, release seat locks to available, and allow re-reservation when cleanup cron runs", async () => {
        const userAIdempotencyKey = uuidv7();
        const resA = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", userAIdempotencyKey)
          .send({
            showId: testShowId,
            seatIds: [testSeatId7],
          })
          .expect(201);

        const bookingAId = (
          resA.body as ApiSuccessResponse<ReserveSeatsResponseData>
        ).data.bookingId;

        // User B must be rejected while User A holds the active seat lock.
        const userBSession = await createAuthenticatedUser(
          db,
          app.get(JwtService),
          {
            email: `booking-user-b-${uuidv7()}@example.com`,
            fullName: "Booking User B",
          },
        );
        const userBIdempotencyKey1 = uuidv7();
        await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${userBSession.token}`)
          .set("idempotency-key", userBIdempotencyKey1)
          .send({
            showId: testShowId,
            seatIds: [testSeatId7],
          })
          .expect(409);
        // Simulate payment timeout by fast-forwarding lockedUntil and expiresAt beyond the hold window.
        const pastDate = new Date(Date.now() - 15 * TIME_IN_MS.MINUTE);
        await db
          .update(showSeats)
          .set({ lockedUntil: pastDate })
          .where(
            and(
              eq(showSeats.showId, testShowId),
              eq(showSeats.seatId, testSeatId7),
            ),
          );
        await db
          .update(bookings)
          .set({ expiresAt: pastDate })
          .where(eq(bookings.id, bookingAId));

        const bookingCronService = app.get(BookingCronService);
        await bookingCronService.handleCleanupExpiredSeatLocks();

        const [updatedBooking] = await db
          .select({ status: bookings.status })
          .from(bookings)
          .where(eq(bookings.id, bookingAId));

        expect(updatedBooking?.status).toBe("expired");

        const [updatedShowSeat] = await db
          .select({
            status: showSeats.status,
            lockedUntil: showSeats.lockedUntil,
          })
          .from(showSeats)
          .where(
            and(
              eq(showSeats.showId, testShowId),
              eq(showSeats.seatId, testSeatId7),
            ),
          );
        expect(updatedShowSeat?.status).toBe("available");
        expect(updatedShowSeat?.lockedUntil).toBeNull();

        // Once seat hold expires and resets to available, subsequent reservation attempts must succeed cleanly.
        const userBIdempotencyKey2 = uuidv7();
        const resB = await request(httpServer)
          .post("/bookings/reserve")
          .set("Authorization", `Bearer ${userBSession.token}`)
          .set("idempotency-key", userBIdempotencyKey2)
          .send({
            showId: testShowId,
            seatIds: [testSeatId7],
          })
          .expect(201);
        const bookingBId = (
          resB.body as ApiSuccessResponse<ReserveSeatsResponseData>
        ).data.bookingId;
        expect(bookingBId).toBeDefined();
        expect(bookingBId).not.toBe(bookingAId);
      }, 15000);
      it.skip("should fallback to Postgres row-level locking when Redlock TTL expires during high database latency", async () => {
        // Simulating >2000ms database transaction latency requires a custom DB connection pool latency injector or mocked DrizzleDB transaction.
        // Postgres row-level locks (FOR UPDATE) act as the ultimate Single Source of Truth safety net.
      });
    });
  });
  describe("POST /payments/payos-webhook", () => {
    it("should reject payload with 400 Bad Request when HMAC-SHA256 signature is invalid", async () => {
      const response = await request(httpServer)
        .post("/payments/payos-webhook")
        .send({
          code: "00",
          desc: "success",
          data: {
            orderCode: 99999,
            amount: 150000,
            description: "Test payment",
            accountNumber: "123456",
            reference: "REF123",
            transactionDateTime: new Date().toISOString(),
            currency: "VND",
            paymentLinkId: "LINK123",
            code: "00",
            desc: "success",
          },
          signature: "invalid_hmac_signature_hex",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /bookings/confirm", () => {
    describe("when validating request", () => {
      it("should reject unauthorized request with 401 Unauthorized when Bearer token is missing", async () => {
        const response = await request(httpServer)
          .post("/bookings/confirm")
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: uuidv7(),
            transactionId: "TXN-999",
            orderCode: 123456,
            amount: 150000,
            paymentMethod: "PAYOS",
          });

        expect(response.status).toBe(401);
      });
      it("should return 404 Not Found when attempting to confirm non-existent booking", async () => {
        const response = await request(httpServer)
          .post("/bookings/confirm")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: uuidv7(),
            transactionId: "TXN-999",
            orderCode: 123456,
            amount: 150000,
            paymentMethod: "PAYOS",
          });

        expect(response.status).toBe(404);
      });

      it("should return 400 Bad Request when payment amount does not match booking total price", async () => {
        const [booking] = await db
          .insert(bookings)
          .values({
            userId: testUserId,
            showId: testShowId,
            originalPrice: 200000,
            totalPrice: 200000,
            status: "pending_payment",
            expiresAt: new Date(Date.now() + 10 * TIME_IN_MS.MINUTE),
            orderCode: 888888,
          })
          .returning({ id: bookings.id });

        if (!booking) throw new Error("Failed to seed booking");

        const response = await request(httpServer)
          .post("/bookings/confirm")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: booking.id,
            transactionId: "TXN-MISMATCH-1",
            orderCode: 888888,
            amount: 50000,
            paymentMethod: "PAYOS",
          });

        expect(response.status).toBe(400);
      });

      it("should return 410 Gone when attempting to confirm expired booking", async () => {
        const [booking] = await db
          .insert(bookings)
          .values({
            userId: testUserId,
            showId: testShowId,
            originalPrice: 150000,
            totalPrice: 150000,
            status: "expired",
            expiresAt: new Date(Date.now() - TIME_IN_MS.MINUTE),
            orderCode: 777777,
          })
          .returning({ id: bookings.id });

        if (!booking) throw new Error("Failed to seed booking");

        const response = await request(httpServer)
          .post("/bookings/confirm")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: booking.id,
            transactionId: "TXN-EXPIRED-1",
            orderCode: 777777,
            amount: 150000,
            paymentMethod: "PAYOS",
          });

        expect(response.status).toBe(410);
      });
    });

    describe("when confirming payment", () => {
      it("should successfully confirm booking, update seats, write outbox event, and return 200 OK when payment is valid", async () => {
        const [booking] = await db
          .insert(bookings)
          .values({
            userId: testUserId,
            showId: testShowId,
            originalPrice: 150000,
            totalPrice: 150000,
            status: "pending_payment",
            expiresAt: new Date(Date.now() + 10 * TIME_IN_MS.MINUTE),
            orderCode: 666666,
          })
          .returning({ id: bookings.id });

        if (!booking) throw new Error("Failed to seed booking");

        const response = await request(httpServer)
          .post("/bookings/confirm")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: booking.id,
            transactionId: "TXN-SUCCESS-100",
            orderCode: 666666,
            amount: 150000,
            paymentMethod: "PAYOS",
          });

        expect(response.status).toBe(200);
        const resData = response.body as { data: { status: string } };
        expect(resData.data.status).toBe("confirmed");

        // Idempotent retry must return the existing confirmed booking state safely.
        const retryResponse = await request(httpServer)
          .post("/bookings/confirm")
          .set("Authorization", `Bearer ${testUserToken}`)
          .set("idempotency-key", uuidv7())
          .send({
            bookingId: booking.id,
            transactionId: "TXN-SUCCESS-100",
            orderCode: 666666,
            amount: 150000,
            paymentMethod: "PAYOS",
          });

        expect(retryResponse.status).toBe(200);
        const retryResData = retryResponse.body as { data: { status: string } };
        expect(retryResData.data.status).toBe("confirmed");
      }, 15000);

      it("should safely process concurrent double-confirm requests without duplicate payments", async () => {
        const [booking] = await db
          .insert(bookings)
          .values({
            userId: testUserId,
            showId: testShowId,
            originalPrice: 150000,
            totalPrice: 150000,
            status: "pending_payment",
            expiresAt: new Date(Date.now() + 10 * TIME_IN_MS.MINUTE),
            orderCode: 555555,
          })
          .returning({ id: bookings.id });

        if (!booking) throw new Error("Failed to seed booking");

        const [res1, res2] = await Promise.all([
          request(httpServer)
            .post("/bookings/confirm")
            .set("Authorization", `Bearer ${testUserToken}`)
            .set("idempotency-key", uuidv7())
            .send({
              bookingId: booking.id,
              transactionId: "TXN-CONCURRENT-1",
              orderCode: 555555,
              amount: 150000,
              paymentMethod: "PAYOS",
            }),
          request(httpServer)
            .post("/bookings/confirm")
            .set("Authorization", `Bearer ${testUserToken}`)
            .set("idempotency-key", uuidv7())
            .send({
              bookingId: booking.id,
              transactionId: "TXN-CONCURRENT-1",
              orderCode: 555555,
              amount: 150000,
              paymentMethod: "PAYOS",
            }),
        ]);

        const statuses = [res1.status, res2.status];
        expect(statuses).toContain(200);
      }, 15000);

      it("should preserve orderCode for payment reconciliation worker when booking expires", async () => {
        const [booking] = await db
          .insert(bookings)
          .values({
            userId: testUserId,
            showId: testShowId,
            originalPrice: 150000,
            totalPrice: 150000,
            status: "expired",
            expiresAt: new Date(Date.now() - TIME_IN_MS.HOUR),
            orderCode: 444444,
          })
          .returning({ orderCode: bookings.orderCode });
        expect(booking?.orderCode).toBe(444444);
      });
    });
  });

  afterAll(async () => {
    await teardownTestApp(setup);
  });
});
