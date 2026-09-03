import { Logger } from "@nestjs/common";
import { resolve } from "node:path";
import { unlink } from "node:fs/promises";
import { and, eq, inArray, like } from "drizzle-orm";
import type { Redis } from "ioredis";
import {
  showSeats,
  tickets,
  bookings,
  shows,
  halls,
  seats,
  cinemas,
  movies,
  users,
} from "@/database/schemas";
import { createRedisClient } from "@/config/redis.config";
import { createTestPool } from "../helpers/database.helper";
import { createDrizzleClient } from "@/database/database.connection";
import type { DrizzleDB } from "@/database/database.module";
import type { BookingLoadFixture } from "./fixtures/types";
import { REDIS_KEYS } from "@/modules/booking/booking.constants";

const logger = new Logger("Verify");

/**
 * Asserts all post-load-test database and Redis state invariants.
 *
 * @param db - Drizzle DB instance connected to target test database
 * @param redis - Redis client instance
 * @param fixture - Test fixture metadata containing show and seat identifiers
 */
export async function verifyDatabaseInvariants(
  db: DrizzleDB,
  redis: Redis,
  fixture: BookingLoadFixture,
): Promise<{ winnerBookingId: string; winnerUserId: string }> {
  logger.log("Asserting post-test database & cache invariants...");

  // Assert hot seat status transitioned to reserved
  const showSeatList = await db
    .select({
      id: showSeats.id,
      status: showSeats.status,
    })
    .from(showSeats)
    .where(
      and(
        eq(showSeats.showId, fixture.showId),
        eq(showSeats.seatId, fixture.targetSeatId),
      ),
    );

  const hotSeat = showSeatList[0];
  if (hotSeat?.status !== "reserved") {
    throw new Error(
      `Invariant violation: Hot seat ${fixture.targetSeatId} status must be 'reserved', received '${String(hotSeat?.status)}'`,
    );
  }

  // Assert exactly 1 ticket was issued for contested hot seat
  const issuedTickets = await db
    .select({
      id: tickets.id,
      bookingId: tickets.bookingId,
    })
    .from(tickets)
    .where(eq(tickets.showSeatId, hotSeat.id));

  if (issuedTickets.length !== 1) {
    throw new Error(
      `Invariant violation: Expected exactly 1 ticket for hot seat ${fixture.targetSeatId}, found ${String(issuedTickets.length)}`,
    );
  }

  const winningTicket = issuedTickets[0];
  if (!winningTicket) {
    throw new Error("Invariant violation: Missing winning ticket record");
  }

  // Assert single winner booking created in pending_payment status
  const [winner] = await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.id, winningTicket.bookingId));
  if (winner?.status !== "pending_payment") {
    throw new Error(
      `Invariant violation: Winner booking status must be 'pending_payment', received '${String(winner?.status)}'`,
    );
  }

  // Assert Redlock mutex released without leaking in Redis
  const lockKey = REDIS_KEYS.showSeatLock(fixture.targetSeatId);
  const activeLock = await redis.get(lockKey);
  if (activeLock !== null) {
    throw new Error(
      `Invariant violation: Redlock key '${lockKey}' leaked in Redis. Lock must be released post-request.`,
    );
  }

  logger.log(
    `All invariants passed! Winner Booking: ${winner.id}, Winner User: ${winner.userId}`,
  );

  return {
    winnerBookingId: winner.id,
    winnerUserId: winner.userId,
  };
}

/**
 * Performs complete teardown of load test entities across PostgreSQL and Redis.
 *
 * @param db - Drizzle DB instance connected to target test database
 * @param redis - Redis client instance
 * @param fixture - Test fixture metadata
 */
export async function teardownTestData(
  db: DrizzleDB,
  redis: Redis,
  fixture: BookingLoadFixture,
): Promise<void> {
  logger.log("Cleaning up load test artifacts and database records...");

  const showBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.showId, fixture.showId));

  const bookingIds = showBookings.map((b: { id: string }) => b.id);
  if (bookingIds.length > 0) {
    await db.delete(tickets).where(inArray(tickets.bookingId, bookingIds));
    await db.delete(bookings).where(inArray(bookings.id, bookingIds));
  }

  await db.delete(showSeats).where(eq(showSeats.showId, fixture.showId));

  const showList = await db
    .select({
      hallId: shows.hallId,
      movieId: shows.movieId,
    })
    .from(shows)
    .where(eq(shows.id, fixture.showId));
  await db.delete(shows).where(eq(shows.id, fixture.showId));

  if (showList.length > 0 && showList[0]) {
    const { hallId, movieId } = showList[0];

    const hallList = await db
      .select({ cinemaId: halls.cinemaId })
      .from(halls)
      .where(eq(halls.id, hallId));
    await db.delete(seats).where(eq(seats.hallId, hallId));
    await db.delete(halls).where(eq(halls.id, hallId));

    if (hallList.length > 0 && hallList[0]) {
      await db.delete(cinemas).where(eq(cinemas.id, hallList[0].cinemaId));
    }

    await db.delete(movies).where(eq(movies.id, movieId));
  }

  const userIds = fixture.users.map((u) => u.id);
  if (userIds.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      await db.delete(users).where(inArray(users.id, chunk));
    }
  }

  // Fallback cleanup of any orphaned load test users
  await db.delete(users).where(like(users.email, "loadtest-%"));

  const lockKey = REDIS_KEYS.showSeatLock(fixture.targetSeatId);
  await redis.del(lockKey);

  logger.log("Database and cache cleanup completed successfully.");
}

/**
 * Main verification and teardown runner.
 */
export async function runVerifyAndTeardown(): Promise<void> {
  const fixturePath = resolve(process.cwd(), "dist/booking-fixtures.json");
  const fixtureFile = Bun.file(fixturePath);

  if (!(await fixtureFile.exists())) {
    logger.warn(
      `No fixtures file found at ${fixturePath}. Skipping verification.`,
    );
    return;
  }

  const fixture = (await fixtureFile.json()) as BookingLoadFixture;
  const pool = createTestPool();
  const db = createDrizzleClient(pool);
  const redis = createRedisClient();

  try {
    await verifyDatabaseInvariants(db, redis, fixture);
    logger.log("Verification and state teardown finished.");
  } finally {
    await teardownTestData(db, redis, fixture);
    try {
      await unlink(fixturePath);
    } catch {
      // File already unlinked or absent
    }
    await redis.quit();
    await pool.end();
  }
}

if (import.meta.main) {
  runVerifyAndTeardown()
    .then(() => {
      process.exit(0);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      logger.error(`Verification or teardown failed: ${message}`, stack);
      process.exit(1);
    });
}
