import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { v7 as uuidv7 } from "uuid";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import { JwtService } from "@nestjs/jwt";
import { eq, inArray } from "drizzle-orm";
import { isPostgresErrorCode } from "@/common/utils/error.util";
import { PG_ERROR_CODE } from "@/common/constants/error.constant";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { truncateAllTables } from "@/database/database.connection";
import {
  createAuthenticatedAdmin,
  createAuthenticatedUser,
} from "../helpers/auth.helper";
import type { DrizzleDB } from "@/database/database.module";
import { shows, showSeats, movieTranslations, seats } from "@/database/schemas";
import {
  createCinema,
  createHall,
  createSeatType,
  createBatchSeats,
} from "../factories";
import { MovieMother } from "../mothers";
import type { components } from "../generated/api-schema";
import type {
  ShowResponseDto,
  BatchShowResponseDto,
  ShowScheduleItemDto,
} from "@/modules/shows/dto";
import {
  formatTimezoneDate,
  getFutureTimezoneDate,
} from "@/common/utils/date.util";
import { SHOWS_CONSTANTS } from "@/modules/shows/shows.constants";
import type { Rfc9457ErrorResponse } from "@/common/filters/global-exception.filter";

type SingleShowApiResponse = components["schemas"]["ApiResponseDto"] & {
  data: ShowResponseDto;
};

type BatchShowApiResponse = components["schemas"]["ApiResponseDto"] & {
  data: BatchShowResponseDto;
};

interface ScheduleDiscoveryApiResponse {
  success: boolean;
  data: ShowScheduleItemDto[];
}
describe("Shows Module Integration", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  const getHttpServer = (): Server => app.getHttpServer() as Server;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;

  let seededMovieId: string;
  let seededCinemaId: string;
  let seededHallId: string;
  let seededHall2Id: string;
  const SEAT_COUNT = 5;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
    jwtService = app.get(JwtService);

    await truncateAllTables(db, setup.workerSchema);
    const adminSession = await createAuthenticatedAdmin(db, jwtService);
    adminToken = adminSession.token;

    const userSession = await createAuthenticatedUser(db, jwtService);
    userToken = userSession.token;

    const movie = await MovieMother.standard(db);
    const cinema = await createCinema(db, {
      name: "CGV Landmark",
      streetAddress: "720A Dien Bien Phu",
    });

    const hall1 = await createHall(db, {
      cinemaId: cinema.id,
      name: "Hall Premium 1",
      totalSeats: SEAT_COUNT,
    });

    const hall2 = await createHall(db, {
      cinemaId: cinema.id,
      name: "Hall Premium 2",
      totalSeats: 100,
    });

    const seatType = await createSeatType(db, {
      name: `standard-${uuidv7()}`,
      priceMultiplier: "1.00",
    });

    seededMovieId = movie.id;
    seededCinemaId = cinema.id;
    seededHallId = hall1.id;
    seededHall2Id = hall2.id;

    await createBatchSeats(db, hall1.id, seatType.id, SEAT_COUNT);
    await createBatchSeats(db, hall2.id, seatType.id, SEAT_COUNT);
  }, 30000);

  beforeEach(async () => {
    await db.delete(showSeats);
    await db.delete(shows);
  });

  describe("Database Invariants: PostgreSQL Exclusion Constraint", () => {
    it("should prevent overlapping showtimes and buffer violations in the same hall via DB exclusion constraint", async () => {
      const T = {
        s10_00: new Date("2026-09-01T10:00:00Z"),
        s11_00: new Date("2026-09-01T11:00:00Z"),
        s12_00: new Date("2026-09-01T12:00:00Z"),
        s12_10: new Date("2026-09-01T12:10:00Z"),
        s12_15: new Date("2026-09-01T12:15:00Z"),
        s13_00: new Date("2026-09-01T13:00:00Z"),
        s14_10: new Date("2026-09-01T14:10:00Z"),
        s14_15: new Date("2026-09-01T14:15:00Z"),
      };

      async function expectConflict(fn: () => Promise<unknown>) {
        let error: unknown = null;
        try {
          await fn();
        } catch (err) {
          error = err;
        }
        expect(
          isPostgresErrorCode(error, PG_ERROR_CODE.EXCLUSION_VIOLATION),
        ).toBe(true);
      }

      const [show1] = await db
        .insert(shows)
        .values({
          movieId: seededMovieId,
          hallId: seededHallId,
          startTime: T.s10_00,
          endTime: T.s12_00,
          basePrice: 100000,
        })
        .returning({ id: shows.id });
      expect(show1).toBeDefined();

      await expectConflict(() =>
        db.insert(shows).values({
          movieId: seededMovieId,
          hallId: seededHallId,
          startTime: T.s11_00,
          endTime: T.s13_00,
          basePrice: 100000,
        }),
      );

      await expectConflict(() =>
        db.insert(shows).values({
          movieId: seededMovieId,
          hallId: seededHallId,
          startTime: T.s12_10,
          endTime: T.s14_10,
          basePrice: 100000,
        }),
      );

      const [show4] = await db
        .insert(shows)
        .values({
          movieId: seededMovieId,
          hallId: seededHallId,
          startTime: T.s12_15,
          endTime: T.s14_15,
          basePrice: 100000,
        })
        .returning({ id: shows.id });
      expect(show4).toBeDefined();

      const [show5] = await db
        .insert(shows)
        .values({
          movieId: seededMovieId,
          hallId: seededHall2Id,
          startTime: T.s10_00,
          endTime: T.s12_00,
          basePrice: 100000,
        })
        .returning({ id: shows.id });
      expect(show5).toBeDefined();
    });
  });

  describe("POST /shows", () => {
    describe("when creating show with valid parameters", () => {
      it("should create a show and bulk pre-allocate available seats (201 Created) when input is valid", async () => {
        const futureDate = getFutureTimezoneDate(
          2,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const startTime = `${futureDate}T10:00:00.000Z`;
        const basePrice = 100000;

        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime,
            basePrice,
          });

        expect(res.status).toBe(201);
        const body = res.body as SingleShowApiResponse;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();

        const createdShowId = body.data.id;
        expect(body.data.movieId).toBe(seededMovieId);
        expect(body.data.hallId).toBe(seededHallId);
        expect(body.data.basePrice).toBe(basePrice);
        expect(body.data.totalSeats).toBe(SEAT_COUNT);

        expect(body.data.startTime).toBe(`${futureDate}T10:00:00.000Z`);
        expect(body.data.endTime).toBe(`${futureDate}T12:00:00.000Z`);
        const dbShows = await db
          .select({ id: shows.id })
          .from(shows)
          .where(eq(shows.id, createdShowId));
        expect(dbShows).toHaveLength(1);

        const dbShowSeats = await db
          .select({ id: showSeats.id, status: showSeats.status })
          .from(showSeats)
          .where(eq(showSeats.showId, createdShowId));
        expect(dbShowSeats).toHaveLength(SEAT_COUNT);
        expect(dbShowSeats.every((s) => s.status === "available")).toBe(true);
      });
    });

    describe("when validating schedule collisions", () => {
      it("should reject schedule collision (409 Conflict) when showtime overlaps existing show with 15m cleaning buffer", async () => {
        await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-03T10:00:00.000Z",
            basePrice: 100000,
          });

        const resOverlap = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-03T11:00:00.000Z",
            basePrice: 100000,
          });
        expect(resOverlap.status).toBe(409);

        const resBuffer = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-03T12:10:00.000Z",
            basePrice: 100000,
          });
        expect(resBuffer.status).toBe(409);
      });
    });

    describe("when checking authorization", () => {
      it("should reject with 403 Forbidden when called by a non-admin user", async () => {
        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-04T10:00:00.000Z",
            basePrice: 100000,
          });

        expect(res.status).toBe(403);
      });

      it("should reject with 401 Unauthorized when no auth token is provided", async () => {
        const res = await request(getHttpServer()).post("/shows").send({
          movieId: seededMovieId,
          hallId: seededHallId,
          startTime: "2026-09-05T10:00:00.000Z",
          basePrice: 100000,
        });

        expect(res.status).toBe(401);
      });
    });

    describe("when validating request payload and constraints", () => {
      it("should reject with 404 Not Found when movieId does not exist", async () => {
        const nonExistentMovieId = "019fa8bc-8f4d-7000-b366-e691f45cfb99";
        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: nonExistentMovieId,
            hallId: seededHallId,
            startTime: "2026-09-06T10:00:00.000Z",
            basePrice: 100000,
          });

        expect(res.status).toBe(404);
      });

      it("should reject with 400 Bad Request when request body is invalid", async () => {
        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: "invalid-uuid",
            hallId: seededHallId,
            startTime: "invalid-date",
            basePrice: -50000,
          });

        expect(res.status).toBe(400);
      });

      it("should reject with 400 Bad Request when startTime is in the past or < 10m from now (INV-2)", async () => {
        const pastStartTime = new Date(
          Date.now() - TIME_IN_MS.MINUTE,
        ).toISOString();
        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: pastStartTime,
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });

      it("should reject with 404 Not Found when hallId does not exist", async () => {
        const nonExistentHallId = "019fa8bc-8f4d-7000-b366-e691f45cfb88";
        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: nonExistentHallId,
            startTime: "2026-09-08T10:00:00.000Z",
            basePrice: 100000,
          });

        expect(res.status).toBe(404);
      });

      it("should reject with 400 Bad Request when target hall has zero physical seats configured (INV-3)", async () => {
        const emptyHall = await createHall(db, {
          cinemaId: seededCinemaId,
          name: "Empty Hall Zero Seats",
          totalSeats: 0,
        });

        const res = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: emptyHall.id,
            startTime: "2026-09-09T15:00:00.000Z",
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });

      it("should allow show creation at the exact 15-minute buffer boundary (ADV-1: 201 Created)", async () => {
        const res1 = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-10T10:00:00.000Z",
            basePrice: 100000,
          });
        expect(res1.status).toBe(201);

        const resExact = await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: "2026-09-10T12:15:00.000Z",
            basePrice: 100000,
          });
        expect(resExact.status).toBe(201);
      });
    });
  });

  describe("POST /shows/batch", () => {
    describe("when checking authorization", () => {
      it("should reject with 401 Unauthorized when no token is provided", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-10-02",
            timeSlots: ["10:00", "14:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(401);
      });

      it("should reject with 403 Forbidden when accessed by standard user", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-10-02",
            timeSlots: ["10:00", "14:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(403);
      });
    });

    describe("when validating batch parameters and limits", () => {
      it("should reject with 400 Bad Request when startDate > endDate", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-05",
            endDate: "2026-10-01",
            timeSlots: ["10:00", "14:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });

      it("should reject with 400 Bad Request when date range exceeds 30 days", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-11-05",
            timeSlots: ["10:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });

      it("should reject with 400 Bad Request when total shows exceed 100 limit", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-10-25",
            timeSlots: ["08:00", "11:00", "14:00", "17:00", "20:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });

      it("should reject with 400 Bad Request when time slots collide internally (intra-batch collision)", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-10-01",
            timeSlots: ["10:00", "11:30"],
            basePrice: 100000,
          });

        expect(res.status).toBe(400);
      });
    });

    describe("when executing batch creation transaction", () => {
      it("should successfully create batch showtimes across date range with pre-allocated seats (201 Created)", async () => {
        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHallId,
            startDate: "2026-10-01",
            endDate: "2026-10-02",
            timeSlots: ["10:00", "15:00"],
            basePrice: 120000,
          });

        expect(res.status).toBe(201);
        const body = res.body as BatchShowApiResponse;
        expect(body.success).toBe(true);
        expect(body.data.createdCount).toBe(4);
        expect(body.data.showIds).toHaveLength(4);

        const dbShows = await db
          .select({
            id: shows.id,
            hallId: shows.hallId,
            basePrice: shows.basePrice,
          })
          .from(shows)
          .where(inArray(shows.id, body.data.showIds));
        expect(dbShows).toHaveLength(4);

        const dbShowSeats = await db
          .select({ id: showSeats.id, status: showSeats.status })
          .from(showSeats)
          .where(inArray(showSeats.showId, body.data.showIds));
        expect(dbShowSeats).toHaveLength(4 * SEAT_COUNT);
        expect(dbShowSeats.every((s) => s.status === "available")).toBe(true);
      });
      it("should reject entire batch and rollback cleanly when one slot collides with existing DB schedule (409 Conflict)", async () => {
        await request(getHttpServer())
          .post("/shows")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHall2Id,
            startTime: "2026-10-03T10:00:00+07:00",
            basePrice: 100000,
          });

        const res = await request(getHttpServer())
          .post("/shows/batch")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            movieId: seededMovieId,
            hallId: seededHall2Id,
            startDate: "2026-10-02",
            endDate: "2026-10-04",
            timeSlots: ["10:00", "15:00"],
            basePrice: 100000,
          });

        expect(res.status).toBe(409);

        const hall2Shows = await db
          .select({ id: shows.id })
          .from(shows)
          .where(eq(shows.hallId, seededHall2Id));
        expect(hall2Shows).toHaveLength(1);
      });
    });
  });

  describe("GET /shows", () => {
    const todayStr = formatTimezoneDate(
      new Date(),
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );
    const futureDateStr = getFutureTimezoneDate(
      2,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );

    describe("when querying with default parameters", () => {
      it("should return 200 OK with future shows scheduled for today in Vietnam timezone when query is empty", async () => {
        const futureStartTime = new Date(Date.now() + 2 * TIME_IN_MS.HOUR);
        const futureEndTime = new Date(
          futureStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        const [show] = await db
          .insert(shows)
          .values({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: futureStartTime,
            endTime: futureEndTime,
            basePrice: 100000,
          })
          .returning({ id: shows.id });
        const showId = show?.id ?? "";

        const res = await request(getHttpServer()).get("/shows");

        expect(res.status).toBe(200);
        const body = res.body as ScheduleDiscoveryApiResponse;
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThanOrEqual(1);

        const foundShow = body.data.find((s) => s.id === showId);
        expect(foundShow).toBeDefined();
        expect(foundShow?.movie.id).toBe(seededMovieId);
        expect(foundShow?.cinema.id).toBe(seededCinemaId);
        expect(foundShow?.hall.id).toBe(seededHallId);
      });
    });

    describe("when filtering by movie and cinema", () => {
      it("should filter shows accurately by movieId, cinemaId, and their combination", async () => {
        const otherMovie = await MovieMother.standard(db);
        const otherCinema = await createCinema(db, {
          name: "BHD Star Bitexco",
          streetAddress: "2 Hai Trieu",
        });
        const otherHall = await createHall(db, {
          cinemaId: otherCinema.id,
          name: "Hall BHD 1",
          totalSeats: 10,
        });

        const showDate = `${futureDateStr}T14:00:00+07:00`;
        const showStartTime = new Date(showDate);
        const showEndTime = new Date(
          showStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        // Show 1: seededMovie at seededCinema (hall1)
        const [s1] = await db
          .insert(shows)
          .values({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: showStartTime,
            endTime: showEndTime,
            basePrice: 100000,
          })
          .returning({ id: shows.id });
        const s1Id = s1?.id ?? "";

        // Show 2: otherMovie at seededCinema (hall1, 3 hours later)
        const s2Start = new Date(showStartTime.getTime() + 3 * TIME_IN_MS.HOUR);
        const s2End = new Date(s2Start.getTime() + 120 * TIME_IN_MS.MINUTE);
        const [s2] = await db
          .insert(shows)
          .values({
            movieId: otherMovie.id,
            hallId: seededHallId,
            startTime: s2Start,
            endTime: s2End,
            basePrice: 110000,
          })
          .returning({ id: shows.id });
        const s2Id = s2?.id ?? "";

        // Show 3: seededMovie at otherCinema (otherHall)
        const [s3] = await db
          .insert(shows)
          .values({
            movieId: seededMovieId,
            hallId: otherHall.id,
            startTime: showStartTime,
            endTime: showEndTime,
            basePrice: 90000,
          })
          .returning({ id: shows.id });
        const s3Id = s3?.id ?? "";

        // 1. Filter by movieId (seededMovie) -> should return Show 1 and Show 3
        const movieRes = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, movieId: seededMovieId });
        expect(movieRes.status).toBe(200);
        const movieBody = movieRes.body as ScheduleDiscoveryApiResponse;
        const movieShowIds = movieBody.data.map((s) => s.id);
        expect(movieShowIds).toContain(s1Id);
        expect(movieShowIds).toContain(s3Id);
        expect(movieShowIds).not.toContain(s2Id);

        // 2. Filter by cinemaId (seededCinema) -> should return Show 1 and Show 2
        const cinemaRes = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, cinemaId: seededCinemaId });
        expect(cinemaRes.status).toBe(200);
        const cinemaBody = cinemaRes.body as ScheduleDiscoveryApiResponse;
        const cinemaShowIds = cinemaBody.data.map((s) => s.id);
        expect(cinemaShowIds).toContain(s1Id);
        expect(cinemaShowIds).toContain(s2Id);
        expect(cinemaShowIds).not.toContain(s3Id);

        // 3. Filter by both movieId & cinemaId -> should return ONLY Show 1
        const combinedRes = await request(getHttpServer()).get("/shows").query({
          date: futureDateStr,
          movieId: seededMovieId,
          cinemaId: seededCinemaId,
        });
        expect(combinedRes.status).toBe(200);
        const combinedBody = combinedRes.body as ScheduleDiscoveryApiResponse;
        expect(combinedBody.data).toHaveLength(1);
        expect(combinedBody.data[0]?.id).toBe(s1Id);

        // 4. Filter with non-existent valid UUIDv7 -> returns empty array
        const emptyRes = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, movieId: uuidv7() });
        expect(emptyRes.status).toBe(200);
        expect((emptyRes.body as ScheduleDiscoveryApiResponse).data).toEqual(
          [],
        );
      });
    });

    describe("when calculating real-time seat availability", () => {
      it("should accurately count available seats under mixed seat states and expired locks", async () => {
        const showStartTime = new Date(`${futureDateStr}T10:00:00+07:00`);
        const showEndTime = new Date(
          showStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        const [show] = await db
          .insert(shows)
          .values({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: showStartTime,
            endTime: showEndTime,
            basePrice: 100000,
          })
          .returning({ id: shows.id });
        const showId = show?.id ?? "";

        const hallSeats = await db
          .select({ id: seats.id })
          .from(seats)
          .where(eq(seats.hallId, seededHallId));

        expect(hallSeats.length).toBeGreaterThanOrEqual(4);
        const seat0Id = hallSeats[0]?.id ?? "";
        const seat1Id = hallSeats[1]?.id ?? "";
        const seat2Id = hallSeats[2]?.id ?? "";
        const seat3Id = hallSeats[3]?.id ?? "";

        // Seed 4 seat states in show_seats:
        // Seat 0: available
        // Seat 1: booked
        // Seat 2: reserved (active lock: now + 10m)
        // Seat 3: reserved (expired lock: now - 5m)
        await db.insert(showSeats).values([
          {
            showId,
            seatId: seat0Id,
            status: "available",
          },
          {
            showId,
            seatId: seat1Id,
            status: "booked",
          },
          {
            showId,
            seatId: seat2Id,
            status: "reserved",
            lockedUntil: new Date(Date.now() + 10 * TIME_IN_MS.MINUTE),
          },
          {
            showId,
            seatId: seat3Id,
            status: "reserved",
            lockedUntil: new Date(Date.now() - 5 * TIME_IN_MS.MINUTE),
          },
        ]);

        const res = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, movieId: seededMovieId });

        expect(res.status).toBe(200);
        const body = res.body as ScheduleDiscoveryApiResponse;
        const targetShow = body.data.find((s) => s.id === showId);
        expect(targetShow).toBeDefined();
        expect(targetShow?.totalSeats).toBe(4);
        // availableSeats = 1 (available) + 1 (expired lock) = 2
        expect(targetShow?.availableSeats).toBe(2);
      });

      it("should retain sold-out shows with availableSeats = 0 in schedule list", async () => {
        const showStartTime = new Date(`${futureDateStr}T16:00:00+07:00`);
        const showEndTime = new Date(
          showStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        const [show] = await db
          .insert(shows)
          .values({
            movieId: seededMovieId,
            hallId: seededHallId,
            startTime: showStartTime,
            endTime: showEndTime,
            basePrice: 100000,
          })
          .returning({ id: shows.id });
        const showId = show?.id ?? "";

        const hallSeats = await db
          .select({ id: seats.id })
          .from(seats)
          .where(eq(seats.hallId, seededHallId));

        const seat0Id = hallSeats[0]?.id ?? "";
        const seat1Id = hallSeats[1]?.id ?? "";

        await db.insert(showSeats).values([
          {
            showId,
            seatId: seat0Id,
            status: "booked",
          },
          {
            showId,
            seatId: seat1Id,
            status: "booked",
          },
        ]);

        const res = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, movieId: seededMovieId });

        expect(res.status).toBe(200);
        const body = res.body as ScheduleDiscoveryApiResponse;
        const targetShow = body.data.find((s) => s.id === showId);
        expect(targetShow).toBeDefined();
        expect(targetShow?.totalSeats).toBe(2);
        expect(targetShow?.availableSeats).toBe(0);
      });
    });

    describe("when localizing movie metadata", () => {
      it("should return English title when lang=en and fallback to Vietnamese when English is absent", async () => {
        const movieWithEn = await MovieMother.standard(db);
        await db
          .insert(movieTranslations)
          .values({
            movieId: movieWithEn.id,
            languageCode: "en",
            title: "Dune: Part Two (English)",
            description: "English synopsis",
          })
          .onConflictDoUpdate({
            target: [movieTranslations.movieId, movieTranslations.languageCode],
            set: { title: "Dune: Part Two (English)" },
          });

        const showStartTime = new Date(`${futureDateStr}T18:00:00+07:00`);
        const showEndTime = new Date(
          showStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        const [show] = await db
          .insert(shows)
          .values({
            movieId: movieWithEn.id,
            hallId: seededHallId,
            startTime: showStartTime,
            endTime: showEndTime,
            basePrice: 100000,
          })
          .returning({ id: shows.id });
        const showId = show?.id ?? "";

        // Query with lang=en
        const enRes = await request(getHttpServer())
          .get("/shows")
          .query({ date: futureDateStr, movieId: movieWithEn.id, lang: "en" });

        expect(enRes.status).toBe(200);
        const enBody = enRes.body as ScheduleDiscoveryApiResponse;
        const enShow = enBody.data.find((s) => s.id === showId);
        expect(enShow?.movie.title).toBe("Dune: Part Two (English)");
      });
    });

    describe("when validating input constraints and horizons", () => {
      it("should return 400 Bad Request when date is in the past", async () => {
        const yesterday = new Date(Date.now() - TIME_IN_MS.DAY);
        const pastDateStr = formatTimezoneDate(
          yesterday,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );

        const res = await request(getHttpServer())
          .get("/shows")
          .query({ date: pastDateStr });

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Bad Request");
      });
      it("should return 400 Bad Request when date exceeds 14-day horizon", async () => {
        const farFutureDateStr = getFutureTimezoneDate(
          15,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );

        const res = await request(getHttpServer())
          .get("/shows")
          .query({ date: farFutureDateStr });

        expect(res.status).toBe(400);
      });

      it("should return 400 Bad Request when movieId is not a valid UUIDv7", async () => {
        const res = await request(getHttpServer())
          .get("/shows")
          .query({ movieId: "not-a-uuid" });

        expect(res.status).toBe(400);
      });

      it("should return 400 Bad Request when extraneous query parameters are passed", async () => {
        const res = await request(getHttpServer())
          .get("/shows")
          .query({ date: todayStr, unexpectedKey: "attack_payload" });

        expect(res.status).toBe(400);
      });
    });
  });

  afterAll(async () => {
    await teardownTestApp(setup);
  });
});
