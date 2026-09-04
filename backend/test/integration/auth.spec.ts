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
import { eq } from "drizzle-orm";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import type { DrizzleDB } from "@/database/database.module";
import { users, refreshTokens, outboxEvents } from "@/database/schemas";
import type { components } from "../generated/api-schema";
import { truncateAllTables } from "@/database/database.connection";

type ApiResponse<T = unknown> = components["schemas"]["ApiResponseDto"] & {
  data?: T;
};
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
type AuthResponse = components["schemas"]["ApiResponseDto"] & {
  data: AuthTokens;
};
type Rfc9457ErrorResponse = components["schemas"]["Rfc9457ErrorResponseDto"] & {
  message?: { property: string; constraints: Record<string, string> }[];
};
describe("Auth Module Integration", () => {
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

  describe("POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout", () => {
    it("should complete the full registration, login, token refresh, and logout lifecycle", async () => {
      const email = "john.doe@example.com";
      const password = "Password123!";

      const registerRes = await request(getHttpServer())
        .post("/auth/register")
        .send({
          email,
          fullName: "John Doe",
          phoneNumber: "0912345678",
          password,
          confirmPassword: password,
          agreeTerms: true,
        });
      expect(registerRes.status).toBe(201);
      const registerBody = registerRes.body as unknown as ApiResponse;
      expect(registerBody.success).toBe(true);
      const [dbUser] = await db
        .select({ status: users.status })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      expect(dbUser).toBeDefined();
      if (!dbUser) throw new Error("dbUser is undefined");
      expect(dbUser.status).toBe("ACTIVE");

      const loginRes = await request(getHttpServer()).post("/auth/login").send({
        email,
        password,
      });
      expect(loginRes.status).toBe(200);
      const loginBody = loginRes.body as unknown as AuthResponse;
      expect(loginBody.success).toBe(true);
      expect(loginBody.data.accessToken).toBeTypeOf("string");
      expect(loginBody.data.refreshToken).toBeTypeOf("string");

      const { refreshToken } = loginBody.data;
      const refreshRes = await request(getHttpServer())
        .post("/auth/refresh")
        .send({
          refreshToken,
        });
      expect(refreshRes.status).toBe(200);
      const refreshBody = refreshRes.body as unknown as AuthResponse;
      expect(refreshBody.success).toBe(true);
      expect(refreshBody.data.accessToken).toBeTypeOf("string");
      expect(refreshBody.data.refreshToken).toBeTypeOf("string");

      const newRefreshToken = refreshBody.data.refreshToken;

      const logoutRes = await request(getHttpServer())
        .post("/auth/logout")
        .send({
          refreshToken: newRefreshToken,
        });
      expect(logoutRes.status).toBe(200);
      const logoutBody = logoutRes.body as unknown as ApiResponse;
      expect(logoutBody.success).toBe(true);
    });
  });

  describe("POST /auth/register", () => {
    describe("when validating registration payload and security controls", () => {
      it("should return 409 Conflict when attempting to register duplicate email", async () => {
        const email = "duplicate@example.com";
        const payload = {
          email,
          fullName: "User A",
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        };

        const firstReg = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(firstReg.status).toBe(201);

        const secondReg = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(secondReg.status).toBe(409);
        const secondRegBody = secondReg.body as unknown as Rfc9457ErrorResponse;
        const actualMsg = secondRegBody.detail;
        expect(["auth.EMAIL_ALREADY_EXISTS", "Email đã tồn tại"]).toContain(
          actualMsg,
        );
      });

      it("should return 400 Bad Request when email format is invalid", async () => {
        const payload = {
          email: "invalid-email",
          fullName: "User B",
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        };

        const res = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(res.status).toBe(400);
        const resBody = res.body as unknown as Rfc9457ErrorResponse;
        const invalidParam = resBody.invalidParams?.[0];
        const firstError = resBody.message?.[0];
        expect(invalidParam?.name ?? firstError?.property).toBe("email");
      });

      it("should sanitize and strip HTML tags from fullName upon registration", async () => {
        const email = "xss@example.com";
        const payload = {
          email,
          fullName: "<b>Test</b> User",
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        };

        const res = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(res.status).toBe(201);

        const [dbUser] = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        expect(dbUser).toBeDefined();
        if (!dbUser) throw new Error("dbUser is undefined");
        expect(dbUser.fullName).toBe("Test User");
      });

      it("should reject registration with 400 Bad Request when fullName consists entirely of stripped script tags", async () => {
        const payload = {
          email: "xss-script@example.com",
          fullName: "<script>alert('XSS')</script>",
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        };

        const res = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(res.status).toBe(400);
        const resBody = res.body as unknown as Rfc9457ErrorResponse;
        const invalidParam = resBody.invalidParams?.[0];
        const firstError = resBody.message?.[0];
        expect(invalidParam?.name ?? firstError?.property).toBe("fullName");
      });

      it("should safely register and parameterize names containing SQL injection syntax", async () => {
        const email = "sqli@example.com";
        const sqlInjectionName = "Admin' OR '1'='1 --";
        const payload = {
          email,
          fullName: sqlInjectionName,
          phoneNumber: "0912345678",
          password: "Password123!",
          confirmPassword: "Password123!",
          agreeTerms: true,
        };

        const res = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(res.status).toBe(201);

        const [dbUser] = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        expect(dbUser).toBeDefined();
        if (!dbUser) throw new Error("dbUser is undefined");
        expect(dbUser.fullName).toBe(sqlInjectionName);
      });

      it("should require email verification before login when status is pending_verification and succeed after verification", async () => {
        const email = "verify@example.com";
        const password = "Password123!";
        const payload = {
          email,
          fullName: "Verify User",
          phoneNumber: "0912345678",
          password,
          confirmPassword: password,
          agreeTerms: true,
        };

        const regRes = await request(getHttpServer())
          .post("/auth/register")
          .send(payload);
        expect(regRes.status).toBe(201);

        const [userBefore] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        expect(userBefore).toBeDefined();
        if (!userBefore) throw new Error("userBefore is undefined");

        await db
          .update(users)
          .set({ status: "PENDING_VERIFICATION" })
          .where(eq(users.id, userBefore.id));

        const loginFailRes = await request(getHttpServer())
          .post("/auth/login")
          .send({ email, password });
        expect(loginFailRes.status).toBe(400);
        const loginFailBody =
          loginFailRes.body as unknown as Rfc9457ErrorResponse;
        const errorMsg = loginFailBody.detail;
        const hasEmailNotVerified = errorMsg.includes(
          "auth.EMAIL_NOT_VERIFIED",
        );
        const hasNotVerifiedVietnamese =
          errorMsg.includes("chưa được xác thực");
        expect(hasEmailNotVerified || hasNotVerifiedVietnamese).toBe(true);

        const [userWithToken] = await db
          .select({ verificationToken: users.verificationToken })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        expect(userWithToken).toBeDefined();
        if (!userWithToken?.verificationToken) {
          throw new Error("Verification token was not generated");
        }

        const verifyRes = await request(getHttpServer())
          .post("/auth/verify-email")
          .send({ token: userWithToken.verificationToken });
        expect(verifyRes.status).toBe(200);

        const loginSuccessRes = await request(getHttpServer())
          .post("/auth/login")
          .send({ email, password });
        expect(loginSuccessRes.status).toBe(200);
        const loginSuccessBody = loginSuccessRes.body as unknown as ApiResponse;
        expect(loginSuccessBody.success).toBe(true);
      }, 15000);
    });
  });

  describe("POST /auth/forgot-password & POST /auth/reset-password", () => {
    const password = "Password123!";

    describe("when processing password reset lifecycle", () => {
      it("should complete forgot password and reset password flow, revoking all active sessions", async () => {
        const email = "forgot.happy@example.com";

        const registerRes = await request(getHttpServer())
          .post("/auth/register")
          .send({
            email,
            fullName: "Happy User",
            phoneNumber: "0987654321",
            password,
            confirmPassword: password,
            agreeTerms: true,
          });
        expect(registerRes.status).toBe(201);

        const forgotRes = await request(getHttpServer())
          .post("/auth/forgot-password")
          .send({ email });
        expect(forgotRes.status).toBe(200);
        const forgotBody = forgotRes.body as unknown as ApiResponse;
        expect(forgotBody.success).toBe(true);
        const [userInDb] = await db
          .select({
            id: users.id,
            resetPasswordToken: users.resetPasswordToken,
            resetPasswordExpiresAt: users.resetPasswordExpiresAt,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        expect(userInDb).toBeDefined();
        if (!userInDb) throw new Error("userInDb is undefined");
        expect(userInDb.resetPasswordToken).not.toBeNull();
        expect(userInDb.resetPasswordExpiresAt).not.toBeNull();

        const expiresAt = userInDb.resetPasswordExpiresAt;
        if (!expiresAt) throw new Error("expiresAt is null");
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

        const resetToken = userInDb.resetPasswordToken;
        if (!resetToken) throw new Error("resetToken is null");

        const outboxEvent = await db
          .select({ payload: outboxEvents.payload })
          .from(outboxEvents)
          .where(
            eq(outboxEvents.eventType, "auth.reset_password_email_requested"),
          )
          .limit(1);
        expect(outboxEvent.length).toBe(1);
        const firstEvent = outboxEvent[0];
        if (!firstEvent) throw new Error("outboxEvent[0] is undefined");
        const payload = firstEvent.payload as {
          email: string;
          token: string;
        };
        expect(payload.email).toBe(email);
        expect(payload.token).toBe(resetToken);

        const loginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({ email, password });
        expect(loginRes.status).toBe(200);
        const loginBody = loginRes.body as unknown as AuthResponse;
        expect(loginBody.success).toBe(true);

        const tokensBefore = await db
          .select({ id: refreshTokens.id })
          .from(refreshTokens)
          .where(eq(refreshTokens.userId, userInDb.id));
        expect(tokensBefore.length).toBeGreaterThanOrEqual(1);

        const newPassword = "NewPassword123!";
        const resetRes = await request(getHttpServer())
          .post("/auth/reset-password")
          .send({
            token: resetToken,
            password: newPassword,
            confirmPassword: newPassword,
          });
        expect(resetRes.status).toBe(200);
        const resetBody = resetRes.body as unknown as ApiResponse;
        expect(resetBody.success).toBe(true);

        const [userAfterReset] = await db
          .select({
            resetPasswordToken: users.resetPasswordToken,
            resetPasswordExpiresAt: users.resetPasswordExpiresAt,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!userAfterReset) throw new Error("userAfterReset is undefined");
        expect(userAfterReset.resetPasswordToken).toBeNull();
        expect(userAfterReset.resetPasswordExpiresAt).toBeNull();

        // Password reset must invalidate and delete all active refresh token sessions.
        const tokensAfter = await db
          .select({ id: refreshTokens.id })
          .from(refreshTokens)
          .where(eq(refreshTokens.userId, userInDb.id));
        expect(tokensAfter.length).toBe(0);

        const oldLoginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({ email, password });
        expect(oldLoginRes.status).toBe(400);

        const newLoginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({ email, password: newPassword });
        expect(newLoginRes.status).toBe(200);
        const newLoginBody = newLoginRes.body as unknown as ApiResponse;
        expect(newLoginBody.success).toBe(true);
      }, 15000);

      it("should prevent password reset token reuse by rejecting duplicate reset attempts", async () => {
        const email = "forgot.reuse@example.com";

        await request(getHttpServer()).post("/auth/register").send({
          email,
          fullName: "Reuse User",
          phoneNumber: "0987654322",
          password,
          confirmPassword: password,
          agreeTerms: true,
        });

        await request(getHttpServer())
          .post("/auth/forgot-password")
          .send({ email });

        const [user] = await db
          .select({ resetPasswordToken: users.resetPasswordToken })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) throw new Error("user is undefined");

        const token = user.resetPasswordToken;
        if (!token) throw new Error("token is null");

        const firstReset = await request(getHttpServer())
          .post("/auth/reset-password")
          .send({
            token,
            password: "NewPassword123!",
            confirmPassword: "NewPassword123!",
          });
        expect(firstReset.status).toBe(200);

        const secondReset = await request(getHttpServer())
          .post("/auth/reset-password")
          .send({
            token,
            password: "AnotherNewPassword123!",
            confirmPassword: "AnotherNewPassword123!",
          });
        expect(secondReset.status).toBe(400);
      });

      it("should return generic success when email does not exist to prevent user enumeration", async () => {
        const nonExistentEmail = "doesnotexist@example.com";
        const res = await request(getHttpServer())
          .post("/auth/forgot-password")
          .send({ email: nonExistentEmail });
        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse;
        expect(body.success).toBe(true);
      });

      it("should reject forgot password request with 400 Bad Request when email format is invalid", async () => {
        const res = await request(getHttpServer())
          .post("/auth/forgot-password")
          .send({ email: "not-an-email" });
        expect(res.status).toBe(400);
      });
    });
  });

  describe("POST /auth/change-password", () => {
    describe("when changing password", () => {
      it("should successfully change password, revoke all refresh tokens, and allow login with new password", async () => {
        const registerRes = await request(getHttpServer())
          .post("/auth/register")
          .send({
            email: "change-pwd-user@example.com",
            fullName: "Change Password User",
            phoneNumber: "0912345678",
            password: "OldPassword123!",
            confirmPassword: "OldPassword123!",
            agreeTerms: true,
          });
        expect(registerRes.status).toBe(201);

        await db
          .update(users)
          .set({ status: "ACTIVE" })
          .where(eq(users.email, "change-pwd-user@example.com"));

        const loginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "change-pwd-user@example.com",
            password: "OldPassword123!",
          });
        expect(loginRes.status).toBe(200);
        const loginBody = loginRes.body as unknown as AuthResponse;
        const { accessToken, refreshToken } = loginBody.data;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();

        const activeTokensBefore = await db
          .select({ id: refreshTokens.id })
          .from(refreshTokens);
        expect(activeTokensBefore.length).toBeGreaterThan(0);

        const changePwdRes = await request(getHttpServer())
          .post("/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "OldPassword123!",
            newPassword: "NewSecurePassword456!",
          });
        expect(changePwdRes.status).toBe(200);
        const changePwdBody = changePwdRes.body as unknown as ApiResponse;
        expect(changePwdBody.success).toBe(true);

        // Password change must trigger global session revocation by purging all refresh tokens.
        const activeTokensAfter = await db
          .select({ id: refreshTokens.id })
          .from(refreshTokens);
        expect(activeTokensAfter.length).toBe(0);

        const failedLoginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "change-pwd-user@example.com",
            password: "OldPassword123!",
          });
        expect(failedLoginRes.status).toBeGreaterThanOrEqual(400);

        const newLoginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "change-pwd-user@example.com",
            password: "NewSecurePassword456!",
          });
        expect(newLoginRes.status).toBe(200);
        const newLoginBody = newLoginRes.body as unknown as AuthResponse;
        expect(newLoginBody.data.accessToken).toBeDefined();
      });

      it("should reject change password request with 401 Unauthorized when Authorization token is missing", async () => {
        const res = await request(getHttpServer())
          .post("/auth/change-password")
          .send({
            currentPassword: "OldPassword123!",
            newPassword: "NewSecurePassword456!",
          });
        expect(res.status).toBe(401);
      });

      it("should reject change password request with 401 Unauthorized when Authorization token is invalid", async () => {
        const res = await request(getHttpServer())
          .post("/auth/change-password")
          .set("Authorization", "Bearer invalid-jwt-token")
          .send({
            currentPassword: "OldPassword123!",
            newPassword: "NewSecurePassword456!",
          });
        expect(res.status).toBe(401);
      });

      it("should reject change password request with 401 Unauthorized when current password is wrong", async () => {
        const regRes = await request(getHttpServer())
          .post("/auth/register")
          .send({
            email: "wrong-pwd-user@example.com",
            fullName: "Wrong Password User",
            phoneNumber: "0912345679",
            password: "RealPassword123!",
            confirmPassword: "RealPassword123!",
            agreeTerms: true,
          });
        expect(regRes.status).toBe(201);

        await db
          .update(users)
          .set({ status: "ACTIVE" })
          .where(eq(users.email, "wrong-pwd-user@example.com"));

        const loginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "wrong-pwd-user@example.com",
            password: "RealPassword123!",
          });
        expect(loginRes.status).toBe(200);
        const accessToken = (loginRes.body as unknown as AuthResponse).data
          .accessToken;

        const changePwdRes = await request(getHttpServer())
          .post("/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "IncorrectOldPassword123!",
            newPassword: "NewSecurePassword456!",
          });
        expect(changePwdRes.status).toBe(401);
      }, 15000);

      it("should reject change password request with 400 Bad Request when new password is identical to current password", async () => {
        await request(getHttpServer()).post("/auth/register").send({
          email: "same-pwd-user@example.com",
          fullName: "Same Password User",
          phoneNumber: "0912345680",
          password: "SamePassword123!",
          confirmPassword: "SamePassword123!",
          agreeTerms: true,
        });

        await db
          .update(users)
          .set({ status: "ACTIVE" })
          .where(eq(users.email, "same-pwd-user@example.com"));

        const loginRes = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "same-pwd-user@example.com",
            password: "SamePassword123!",
          });
        const accessToken = (loginRes.body as unknown as AuthResponse).data
          .accessToken;

        const changePwdRes = await request(getHttpServer())
          .post("/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "SamePassword123!",
            newPassword: "SamePassword123!",
          });
        expect(changePwdRes.status).toBe(400);
      }, 15000);
    });
  });

  describe("POST /auth/logout-all", () => {
    describe("when revoking all user sessions", () => {
      it("should successfully revoke all refresh tokens for the authenticated user", async () => {
        await request(getHttpServer()).post("/auth/register").send({
          email: "logout-all-user@example.com",
          fullName: "Logout All User",
          phoneNumber: "0912345681",
          password: "LogoutPassword123!",
          confirmPassword: "LogoutPassword123!",
          agreeTerms: true,
        });

        await db
          .update(users)
          .set({ status: "ACTIVE" })
          .where(eq(users.email, "logout-all-user@example.com"));

        const loginRes1 = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "logout-all-user@example.com",
            password: "LogoutPassword123!",
          });
        const authData1 = (loginRes1.body as unknown as AuthResponse).data;

        const loginRes2 = await request(getHttpServer())
          .post("/auth/login")
          .send({
            email: "logout-all-user@example.com",
            password: "LogoutPassword123!",
          });
        const authData2 = (loginRes2.body as unknown as AuthResponse).data;

        const logoutAllRes = await request(getHttpServer())
          .post("/auth/logout-all")
          .set("Authorization", `Bearer ${authData1.accessToken}`);
        expect(logoutAllRes.status).toBe(200);

        const refreshRes1 = await request(getHttpServer())
          .post("/auth/refresh")
          .send({ refreshToken: authData1.refreshToken });
        expect(refreshRes1.status).toBe(401);

        const refreshRes2 = await request(getHttpServer())
          .post("/auth/refresh")
          .send({ refreshToken: authData2.refreshToken });
        expect(refreshRes2.status).toBe(401);
      }, 15000);

      it("should reject logout-all request with 401 Unauthorized when Authorization token is missing", async () => {
        const res = await request(getHttpServer()).post("/auth/logout-all");
        expect(res.status).toBe(401);
      });
    });
  });
});
