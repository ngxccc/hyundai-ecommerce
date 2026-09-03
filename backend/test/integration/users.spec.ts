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
import { JwtService } from "@nestjs/jwt";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { truncateAllTables } from "@/database/database.connection";
import { createAuthenticatedUser } from "../helpers/auth.helper";
import type { DrizzleDB } from "@/database/database.module";
import type { components } from "../generated/api-schema";

type UserProfileData = components["schemas"]["UserResponseDto"];
type GetProfileResponse = components["schemas"]["ApiResponseDto"] & {
  data: UserProfileData;
};
type Rfc9457ErrorResponse = components["schemas"]["Rfc9457ErrorResponseDto"];

describe("Users Module Integration", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  let jwtService: JwtService;

  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
    jwtService = app.get(JwtService);
  }, 30000);

  beforeEach(async () => {
    await truncateAllTables(db, setup.workerSchema);
  }, 15000);

  afterAll(async () => {
    await teardownTestApp(setup);
  });

  describe("GET /users/me", () => {
    it("should return 200 OK with user profile payload when authenticated", async () => {
      const email = "test.user@example.com";
      const { user, authHeader } = await createAuthenticatedUser(
        db,
        jwtService,
        { email },
      );

      const profileRes = await request(getHttpServer())
        .get("/users/me")
        .set(authHeader);

      expect(profileRes.status).toBe(200);
      const profileBody = profileRes.body as unknown as GetProfileResponse;
      expect(profileBody.success).toBe(true);
      expect(profileBody.data.email).toBe(email);
      expect(profileBody.data.fullName).toBe(user.fullName);
      expect(profileBody.data.role).toBe("user");
      expect(profileBody.data.isVerified).toBe(true);
      expect(profileBody.data.status).toBe("active");
    });

    it("should return 401 Unauthorized in RFC 9457 format when Bearer token is missing", async () => {
      const res = await request(getHttpServer()).get("/users/me");

      expect(res.status).toBe(401);
      const body = res.body as unknown as Rfc9457ErrorResponse;
      expect(body.status).toBe(401);
      expect(body.title).toBe("Unauthorized");
      expect(body.instance).toBe("/users/me");
    });

    it("should return 403 Forbidden in RFC 9457 format when account status is suspended", async () => {
      const { authHeader } = await createAuthenticatedUser(db, jwtService, {
        email: "suspended.user@example.com",
        fullName: "Suspended User",
        status: "suspended",
      });

      const profileRes = await request(getHttpServer())
        .get("/users/me")
        .set(authHeader);

      expect(profileRes.status).toBe(403);
      const body = profileRes.body as unknown as Rfc9457ErrorResponse;
      expect(body.status).toBe(403);
      expect(body.title).toBe("Forbidden");
      expect(body.instance).toBe("/users/me");
    });
  });
});
