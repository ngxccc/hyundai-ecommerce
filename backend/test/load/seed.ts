import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { resolve } from "node:path";
import { users, type NewUser, type User } from "@/database/schemas";
import { env } from "@/env";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import { createTestPool } from "../helpers/database.helper";
import { createDrizzleClient } from "@/database/database.connection";
import { generateTestToken } from "../helpers/auth.helper";
import type { BookingLoadFixture, TestUserFixture } from "./fixtures/types";
import {
  createMovie,
  createCinema,
  createHall,
  createSeatType,
  createBatchSeats,
  createShow,
  createBatchShowSeats,
} from "../factories";

const logger = new Logger("Seed");

/**
 * Initializes a PostgreSQL connection pool and Drizzle DB instance for load test seeding.
 */
export function createSeedDatabaseConnection() {
  const pool = createTestPool();
  const db = createDrizzleClient(pool);
  return { pool, db };
}

/**
 * Seeds required DAG test entities in PostgreSQL and pre-generates signed JWT access tokens
 * for k6 Virtual Users, persisting the output to `test/load/fixtures/booking-fixtures.json`.
 */
export async function seedLoadTestData(): Promise<BookingLoadFixture> {
  const { pool, db } = createSeedDatabaseConnection();
  const jwtService = new JwtService({ secret: env.JWT_SECRET });
  const totalVus = env.VUS;
  const timestamp = String(Date.now());
  try {
    logger.log(
      `Initializing test data for ${String(totalVus)} Virtual Users...`,
    );

    const movie = await createMovie(db, {
      durationMinutes: 120,
    });
    const cinema = await createCinema(db, {
      name: `Load Test Cinema ${timestamp}`,
    });
    const hall = await createHall(db, {
      cinemaId: cinema.id,
      name: "Hall IMAX VIP",
      totalSeats: 100,
    });
    const seatType = await createSeatType(db, {
      name: `VIP-${timestamp}`,
      priceMultiplier: "1.50",
    });

    const seats = await createBatchSeats(db, hall.id, seatType.id, 10);
    const seatIds = seats.map((s) => s.id);
    const targetSeatId = seatIds[0];
    if (!targetSeatId) {
      throw new Error("Failed to provision seats for load testing");
    }
    const otherSeatIds = seatIds.slice(1);

    const show = await createShow(db, {
      movieId: movie.id,
      hallId: hall.id,
      startTime: new Date(Date.now() + TIME_IN_MS.DAY),
      endTime: new Date(Date.now() + TIME_IN_MS.DAY + 2 * TIME_IN_MS.HOUR),
      basePrice: 150000,
    });

    await createBatchShowSeats(db, show.id, seatIds);

    logger.log(
      `Created Show ID: ${show.id}, Target Hot Seat ID: ${targetSeatId}`,
    );

    const userFixtures: TestUserFixture[] = [];
    const userInsertValues: NewUser[] = [];

    for (let i = 0; i < totalVus; i++) {
      const userEmail = `loadtest-${timestamp}-${String(i)}@example.com`;
      userInsertValues.push({
        email: userEmail,
        fullName: `Load User ${String(i)}`,
        role: "user",
        status: "active",
      });
    }

    // Batch insert users in chunks of 500 to stay within PostgreSQL parameter limits ($65,535)
    const chunkSize = 500;
    const insertedUsers: Pick<User, "id" | "email" | "role">[] = [];

    for (let i = 0; i < userInsertValues.length; i += chunkSize) {
      const chunk = userInsertValues.slice(i, i + chunkSize);
      const insertedChunk = await db.insert(users).values(chunk).returning({
        id: users.id,
        email: users.email,
        role: users.role,
      });
      insertedUsers.push(...insertedChunk);
    }
    // Pre-sign JWT tokens offline using JWT_SECRET to eliminate Auth service CPU bottlenecks during k6 load runs.
    for (let i = 0; i < insertedUsers.length; i++) {
      const user = insertedUsers[i];
      if (!user) continue;

      const token = await generateTestToken(jwtService, {
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      userFixtures.push({
        id: user.id,
        email: user.email,
        token,
        ip: `10.0.${String(Math.floor(i / 256))}.${String(i % 256)}`,
      });
    }

    logger.log(
      `Generated and signed ${String(userFixtures.length)} JWT tokens successfully.`,
    );

    const fixturePayload: BookingLoadFixture = {
      targetUrl: env.TARGET_URL,
      showId: show.id,
      targetSeatId,
      otherSeatIds,
      totalVus,
      users: userFixtures,
    };

    const fixtureFilePath = resolve(
      process.cwd(),
      "dist/booking-fixtures.json",
    );
    await Bun.write(fixtureFilePath, JSON.stringify(fixturePayload, null, 2));

    logger.log(`Fixtures written to ${fixtureFilePath}`);

    return fixturePayload;
  } finally {
    await pool.end();
  }
}

// Execute standalone if invoked directly
if (import.meta.main) {
  seedLoadTestData()
    .then(() => {
      logger.log("Completed test fixture setup successfully.");
      process.exit(0);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      logger.error(`Error during seeding: ${message}`, stack);
      process.exit(1);
    });
}
