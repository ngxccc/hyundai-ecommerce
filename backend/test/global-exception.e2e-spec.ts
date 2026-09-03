import {
  describe,
  expect,
  it,
  beforeAll,
  beforeEach,
  afterAll,
} from "bun:test";
import request from "supertest";
import { type INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "./helpers/app.helper";
import type { DrizzleDB } from "@/database/database.module";
import type { Rfc9457ErrorResponse } from "@/common/filters/global-exception.filter";
import { truncateAllTables } from "@/database/database.connection";

describe("GlobalExceptionFilter Pipeline E2E", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
  }, 30000);

  beforeEach(async () => {
    await truncateAllTables(db, setup.workerSchema);
  }, 15000);

  afterAll(async () => {
    await teardownTestApp(setup);
  });

  describe("when handling DTO validation failures", () => {
    it("should return RFC 9457 formatted 400 Bad Request with application/problem+json on DTO validation failure", async () => {
      const res = await request(getHttpServer())
        .post("/auth/register")
        .send({
          email: "invalid-email-format",
          fullName: "Test User",
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        })
        .expect(400);

      expect(res.headers["content-type"]).toContain("application/problem+json");

      const body = res.body as Rfc9457ErrorResponse;
      expect(body.title).toBe("Bad Request");
      expect(body.status).toBe(400);
      expect(body.instance).toBe("/auth/register");
      expect(body.type).toContain("/errors/bad-request");
      expect(Array.isArray(body.invalidParams)).toBe(true);
      expect(body.invalidParams.length).toBeGreaterThan(0);
      expect(body.invalidParams[0]).toHaveProperty("name");
      expect(body.invalidParams[0]).toHaveProperty("reason");
    });
  });

  describe("when handling authentication failures", () => {
    it("should return RFC 9457 formatted 401 Unauthorized with application/problem+json on auth failure", async () => {
      const res = await request(getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(res.headers["content-type"]).toContain("application/problem+json");

      const body = res.body as Rfc9457ErrorResponse;
      expect(body.title).toBe("Unauthorized");
      expect(body.status).toBe(401);
      expect(body.instance).toBe("/auth/login");
      expect(body.type).toContain("/errors/unauthorized");
      expect(body.invalidParams).toEqual([]);
    });
  });
});
