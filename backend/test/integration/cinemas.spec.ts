import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { truncateAllTables } from "@/database/database.connection";
import type { DrizzleDB } from "@/database/database.module";
import { createCinema, createHall } from "../factories/cinema.factory";
import type { ApiResponse } from "@/common/utils/api-response.util";
import type {
  CinemaResponseDto,
  PaginationMetaDto,
} from "@/modules/catalog/dto";
import type { Rfc9457ErrorResponse } from "@/common/filters/global-exception.filter";

describe("Catalog Module Integration - Cinemas", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
  }, 30000);

  afterAll(async () => {
    await teardownTestApp(setup);
  });

  beforeEach(async () => {
    await truncateAllTables(db, setup.workerSchema);
  });

  describe("GET /cinemas", () => {
    describe("when discovering cinema venues with pagination", () => {
      it("should return 200 OK with paginated cinemas and computed totalHalls (INV-12)", async () => {
        const cinema1 = await createCinema(db, {
          name: "CGV Vincom Đồng Khởi",
          city: "Thành phố Hồ Chí Minh",
          ward: "Phường Bến Nghé",
          streetAddress: "72 Lê Thánh Tôn",
          postalCode: "70000",
        });
        const cinema2 = await createCinema(db, {
          name: "Lotte Cinema Landmark",
          city: "Thành phố Hà Nội",
          ward: "Phường Mễ Trì",
          streetAddress: "Phạm Hùng",
          postalCode: "10000",
        });

        await createHall(db, { cinemaId: cinema1.id, name: "Hall 1" });
        await createHall(db, { cinemaId: cinema1.id, name: "Hall 2" });
        await createHall(db, { cinemaId: cinema1.id, name: "Hall 3" });
        await createHall(db, { cinemaId: cinema2.id, name: "Hall A" });

        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ page: 1, limit: 10 })
          .expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.success).toBe(true);
        expect(body.meta?.total).toBe(2);
        expect(body.meta?.page).toBe(1);
        expect(body.meta?.limit).toBe(10);
        expect(body.meta?.totalPages).toBe(1);

        const item1 = body.data.find((c) => c.id === cinema1.id);
        const item2 = body.data.find((c) => c.id === cinema2.id);

        expect(item1).toBeDefined();
        expect(item1?.totalHalls).toBe(3);
        expect(item1?.name).toBe("CGV Vincom Đồng Khởi");
        expect(item1?.city).toBe("Thành phố Hồ Chí Minh");
        expect(item1?.ward).toBe("Phường Bến Nghé");

        expect(item2).toBeDefined();
        expect(item2?.totalHalls).toBe(1);
        expect(item2?.name).toBe("Lotte Cinema Landmark");
      });

      it("should return 0 totalHalls for cinemas with no active halls", async () => {
        const cinema = await createCinema(db, {
          name: "BHD Star Bitexco",
          city: "Thành phố Hồ Chí Minh",
          ward: "Phường Bến Nghé",
          streetAddress: "2 Hải Triều",
        });

        const res = await request(getHttpServer()).get("/cinemas").expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data).toHaveLength(1);
        expect(body.data[0]?.id).toBe(cinema.id);
        expect(body.data[0]?.totalHalls).toBe(0);
      });
    });

    describe("when filtering cinemas", () => {
      it("should filter cinemas by city (case-insensitive substring match)", async () => {
        await createCinema(db, {
          name: "CGV Vincom",
          city: "Thành phố Hồ Chí Minh",
          ward: "Bến Nghé",
          streetAddress: "72 Lê Thánh Tôn",
        });
        await createCinema(db, {
          name: "CGV Bà Triệu",
          city: "Thành phố Hà Nội",
          ward: "Lê Đại Hành",
          streetAddress: "191 Bà Triệu",
        });

        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ city: "Hồ Chí Minh" })
          .expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.meta?.total).toBe(1);
        expect(body.data[0]?.city).toBe("Thành phố Hồ Chí Minh");
      });

      it("should filter cinemas by ward (case-insensitive substring match)", async () => {
        await createCinema(db, {
          name: "CGV Vincom",
          city: "Hồ Chí Minh",
          ward: "Phường Bến Nghé",
          streetAddress: "72 Lê Thánh Tôn",
        });
        await createCinema(db, {
          name: "Galaxy Nguyễn Du",
          city: "Hồ Chí Minh",
          ward: "Phường Bến Thành",
          streetAddress: "116 Nguyễn Du",
        });

        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ ward: "Bến Nghé" })
          .expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.meta?.total).toBe(1);
        expect(body.data[0]?.ward).toBe("Phường Bến Nghé");
      });

      it("should filter cinemas by search keyword matching cinema name or address", async () => {
        await createCinema(db, {
          name: "Cinestar Quốc Thanh",
          city: "Hồ Chí Minh",
          ward: "Nguyễn Cư Trinh",
          streetAddress: "271 Nguyễn Trãi",
        });
        await createCinema(db, {
          name: "Mega GS Cao Thắng",
          city: "Hồ Chí Minh",
          ward: "Võ Thị Sáu",
          streetAddress: "19 Cao Thắng",
        });

        const resName = await request(getHttpServer())
          .get("/cinemas")
          .query({ search: "Cinestar" })
          .expect(200);

        const bodyName = resName.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(bodyName.meta?.total).toBe(1);
        expect(bodyName.data[0]?.name).toBe("Cinestar Quốc Thanh");
        const resAddr = await request(getHttpServer())
          .get("/cinemas")
          .query({ search: "Cao Thắng" })
          .expect(200);

        const bodyAddr = resAddr.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(bodyAddr.meta?.total).toBe(1);
        expect(bodyAddr.data[0]?.name).toBe("Mega GS Cao Thắng");
      });

      it("should return empty list when no cinemas match the filters", async () => {
        await createCinema(db, {
          name: "CGV Vincom",
          city: "Hồ Chí Minh",
          ward: "Bến Nghé",
          streetAddress: "72 Lê Thánh Tôn",
        });

        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ city: "Đà Nẵng" })
          .expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data).toHaveLength(0);
        expect(body.meta?.total).toBe(0);
        expect(body.meta?.totalPages).toBe(0);
      });
    });

    describe("when ordering cinemas (INV-12)", () => {
      it("should return cinemas ordered deterministically by city ASC, ward ASC, name ASC, id ASC", async () => {
        await createCinema(db, {
          name: "Cinema B",
          city: "Hồ Chí Minh",
          ward: "Phường 2",
          streetAddress: "Address B",
        });
        await createCinema(db, {
          name: "Cinema A",
          city: "Hồ Chí Minh",
          ward: "Phường 1",
          streetAddress: "Address A",
        });
        await createCinema(db, {
          name: "Cinema H",
          city: "Hà Nội",
          ward: "Phường A",
          streetAddress: "Address H",
        });

        const res = await request(getHttpServer()).get("/cinemas").expect(200);

        const body = res.body as ApiResponse<
          CinemaResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data).toHaveLength(3);
        expect(body.data[0]?.city).toBe("Hà Nội");
        expect(body.data[1]?.ward).toBe("Phường 1");
        expect(body.data[2]?.ward).toBe("Phường 2");
      });
    });

    describe("when validation fails (RFC 9457)", () => {
      it("should return 400 Bad Request when page is less than 1", async () => {
        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ page: 0 })
          .expect(400);

        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(400);
        expect(body.invalidParams).toBeDefined();
      });

      it("should return 400 Bad Request when limit exceeds 100", async () => {
        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ limit: 101 })
          .expect(400);

        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(400);
        expect(body.invalidParams).toBeDefined();
      });

      it("should return 400 Bad Request when unknown query parameters are passed (.strict)", async () => {
        const res = await request(getHttpServer())
          .get("/cinemas")
          .query({ unknownParam: "malicious" })
          .expect(400);

        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(400);
        expect(body.invalidParams).toBeDefined();
      });
    });
  });
});
