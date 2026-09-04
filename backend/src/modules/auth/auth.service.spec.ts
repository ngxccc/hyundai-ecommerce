import { AuthService } from "./auth.service";
import type { DrizzleDB } from "@/database/database.module";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import type { RegisterDto } from "./dto";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";
import { hashPassword } from "@/common/utils/crypto.util";
import { OUTBOX_EVENT_TYPE } from "@/common/constants/event.constant";
import { PG_ERROR_CODE } from "@/common/constants/error.constant";

describe("AuthService", () => {
  let service: AuthService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();
  const mockJwtService = {
    signAsync: mock(() => Promise.resolve("mock_access_token")),
    verifyAsync: mock(() =>
      Promise.resolve({ sub: "user-id", email: "test@example.com" }),
    ),
    clearAll() {
      this.signAsync.mockClear();
      this.verifyAsync.mockClear();
    },
  };

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    mockJwtService.clearAll();

    service = new AuthService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
      mockJwtService as unknown as JwtService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "test@example.com",
      fullName: "Test User",
      phoneNumber: "0912345678",
      password: "Password123",
      confirmPassword: "Password123",
      agreeTerms: true,
    };

    it("should successfully register a new user and return success-data JSON", async () => {
      mockDb.setSelectResult([]);

      await service.register(registerDto);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          fullName: registerDto.fullName,
          phoneNumber: registerDto.phoneNumber,
        }),
      );
      expect(mockDb.mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
          payload: expect.objectContaining({
            email: registerDto.email,
            fullName: registerDto.fullName,
            token: expect.any(String) as unknown as string,
          }) as unknown,
        }),
      );
    });

    it("should throw ConflictException with localized message if email already exists", async () => {
      mockDb.setSelectResult([{ id: "some-uuid" }]);

      let thrown = false;
      try {
        await service.register(registerDto);
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(ConflictException);
        expect((err as ConflictException).message).toBe(
          "auth.EMAIL_ALREADY_EXISTS",
        );
      }
      expect(thrown).toBe(true);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it("should catch Postgres UNIQUE_VIOLATION on DB insert and throw ConflictException", async () => {
      mockDb.setSelectResult([]);
      const pgError = Object.assign(new Error("Duplicate key"), {
        code: PG_ERROR_CODE.UNIQUE_VIOLATION,
        detail: "Key (email)=(test@example.com) already exists.",
      });
      mockDb.transaction.mockImplementationOnce(() => Promise.reject(pgError));

      let thrown = false;
      try {
        await service.register(registerDto);
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(ConflictException);
        expect((err as ConflictException).message).toBe(
          "auth.EMAIL_ALREADY_EXISTS",
        );
      }
      expect(thrown).toBe(true);
    });
  });

  describe("verifyEmail", () => {
    const validToken = "valid-token-123";

    it("should successfully verify email and active the user", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);
      mockDb.setSelectResult([
        {
          id: "user-uuid",
          email: "test@example.com",
          verificationToken: validToken,
          verificationExpiresAt: futureDate,
        },
      ]);

      await service.verifyEmail(validToken);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "ACTIVE",
          verificationToken: null,
          verificationExpiresAt: null,
        }),
      );
    });

    it("should throw BadRequestException if token is invalid (user not found)", async () => {
      mockDb.setSelectResult([]);

      let thrown = false;
      try {
        await service.verifyEmail("invalid-token");
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(BadRequestException);
        expect((err as BadRequestException).message).toBe(
          "auth.VERIFICATION_TOKEN_INVALID",
        );
      }
      expect(thrown).toBe(true);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if verification token has expired", async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60);
      mockDb.setSelectResult([
        {
          id: "user-uuid",
          email: "test@example.com",
          verificationToken: validToken,
          verificationExpiresAt: pastDate,
        },
      ]);

      let thrown = false;
      try {
        await service.verifyEmail(validToken);
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(BadRequestException);
        expect((err as BadRequestException).message).toBe(
          "auth.VERIFICATION_TOKEN_EXPIRED",
        );
      }
      expect(thrown).toBe(true);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe("resendVerificationEmail", () => {
    it("should generate a new verification token and insert outbox event if user exists and is unverified", async () => {
      mockDb.setSelectResult([
        {
          id: "unverified-user-id",
          fullName: "Unverified User",
          status: "PENDING_VERIFICATION",
        },
      ]);

      await service.resendVerificationEmail({
        email: "unverified@example.com",
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.transaction).toHaveBeenCalled();
    });
    it("should return success(null) silently without updating if resend request is within 60s cooldown window", async () => {
      const recentExpiresAt = new Date(
        Date.now() + (24 * 60 * 60 * 1000 - 10 * 1000),
      );
      mockDb.setSelectResult([
        {
          id: "unverified-user-id",
          fullName: "Unverified User",
          status: "PENDING_VERIFICATION",
          verificationExpiresAt: recentExpiresAt,
        },
      ]);

      await service.resendVerificationEmail({
        email: "unverified@example.com",
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).not.toHaveBeenCalled();
      expect(mockDb.mockInsertValues).not.toHaveBeenCalled();
    });

    it("should return success(null) silently without updating if user is already verified or active (anti-enumeration)", async () => {
      mockDb.setSelectResult([
        {
          id: "verified-user-id",
          fullName: "Verified User",
          status: "ACTIVE",
        },
      ]);

      await service.resendVerificationEmail({
        email: "verified@example.com",
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).not.toHaveBeenCalled();
      expect(mockDb.mockInsertValues).not.toHaveBeenCalled();
    });

    it("should return success(null) silently without updating if user status is suspended or inactive (anti-enumeration)", async () => {
      mockDb.setSelectResult([
        {
          id: "suspended-user-id",
          fullName: "Suspended User",
          status: "SUSPENDED",
        },
      ]);

      await service.resendVerificationEmail({
        email: "suspended@example.com",
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).not.toHaveBeenCalled();
      expect(mockDb.mockInsertValues).not.toHaveBeenCalled();
    });

    it("should return success(null) silently without error if user is not found (anti-enumeration)", async () => {
      mockDb.setSelectResult([]);

      await service.resendVerificationEmail({
        email: "nonexistent@example.com",
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).not.toHaveBeenCalled();
      expect(mockDb.mockInsertValues).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should successfully log in and return tokens + user info when credentials are correct", async () => {
      const passwordHash = await hashPassword("Password123");
      mockDb.setSelectResult([
        {
          id: "user-uuid",
          email: "test@example.com",
          fullName: "Test User",
          role: "SALES",
          status: "ACTIVE",
          passwordHash,
        },
      ]);

      const result = await service.login({
        email: "test@example.com",
        password: "Password123",
      });

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual({
        id: "user-uuid",
        email: "test@example.com",
        fullName: "Test User",
        role: "SALES",
        status: "ACTIVE",
      });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw BadRequestException if user is not found", async () => {
      mockDb.setSelectResult([]);

      let thrown = false;
      try {
        await service.login({
          email: "nonexistent@example.com",
          password: "Password123",
        });
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(BadRequestException);
        expect((err as BadRequestException).message).toBe(
          "auth.INVALID_CREDENTIALS",
        );
      }
      expect(thrown).toBe(true);
    });

    it("should throw BadRequestException if password is incorrect", async () => {
      const passwordHash = await hashPassword("Password123");
      mockDb.setSelectResult([
        {
          id: "user-uuid",
          email: "test@example.com",
          status: "ACTIVE",
          passwordHash,
        },
      ]);

      let thrown = false;
      try {
        await service.login({
          email: "test@example.com",
          password: "WrongPassword",
        });
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(BadRequestException);
        expect((err as BadRequestException).message).toBe(
          "auth.INVALID_CREDENTIALS",
        );
      }
      expect(thrown).toBe(true);
    });

    it("should throw BadRequestException if user email is not verified", async () => {
      const passwordHash = await hashPassword("Password123");
      mockDb.setSelectResult([
        {
          id: "user-uuid",
          email: "test@example.com",
          status: "PENDING_VERIFICATION",
          passwordHash,
        },
      ]);

      let thrown = false;
      try {
        await service.login({
          email: "test@example.com",
          password: "Password123",
        });
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(BadRequestException);
        expect((err as BadRequestException).message).toBe(
          "auth.EMAIL_NOT_VERIFIED",
        );
      }
      expect(thrown).toBe(true);
    });
  });

  describe("refreshToken", () => {
    it("should successfully rotate and return new tokens if refresh token is valid", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);
      mockDb.setSelectResultsQueue([
        [
          {
            id: "token-record-id",
            userId: "user-uuid",
            tokenHash: "hashed_token",
            isRevoked: false,
            expiresAt: futureDate,
          },
        ],
        [
          {
            id: "user-uuid",
            email: "test@example.com",
            role: "SALES",
            status: "ACTIVE",
          },
        ],
      ]);

      const result = await service.refreshToken({
        refreshToken: "valid_refresh_token",
      });

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBeDefined();
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if refresh token is not found", async () => {
      mockDb.setSelectResult([]);

      let thrown = false;
      try {
        await service.refreshToken({
          refreshToken: "invalid_refresh_token",
        });
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as UnauthorizedException).message).toBe(
          "auth.TOKEN_INVALID_OR_EXPIRED",
        );
      }
      expect(thrown).toBe(true);
    });
  });

  describe("logout", () => {
    it("should successfully delete the refresh token if valid", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);
      mockDb.setSelectResult([
        {
          id: "token-record-id",
          isRevoked: false,
          expiresAt: futureDate,
        },
      ]);

      await service.logout({
        refreshToken: "valid_refresh_token",
      });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if refresh token is not found", async () => {
      mockDb.setSelectResult([]);

      let thrown = false;
      try {
        await service.logout({
          refreshToken: "invalid_refresh_token",
        });
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as UnauthorizedException).message).toBe(
          "auth.TOKEN_INVALID_OR_EXPIRED",
        );
      }
      expect(thrown).toBe(true);
    });
  });

  describe("logoutAll", () => {
    it("should successfully delete all refresh tokens for user", async () => {
      await service.logoutAll("user-uuid-123");
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if userId is empty", async () => {
      let thrown = false;
      try {
        await service.logoutAll("");
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
      expect(thrown).toBe(true);
    });
  });

  describe("forgotPassword", () => {
    it("should return success generic response if user is not found", async () => {
      mockDb.setSelectResult([]);
      await service.forgotPassword({
        email: "notfound@example.com",
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should return success generic response if user is found but not active", async () => {
      mockDb.setSelectResult([
        {
          id: "user-id",
          fullName: "Test User",
          status: "PENDING_VERIFICATION",
        },
      ]);
      await service.forgotPassword({
        email: "pending@example.com",
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should successfully generate reset token and write to outbox", async () => {
      mockDb.setSelectResult([
        { id: "user-id", fullName: "Test User", status: "ACTIVE" },
      ]);
      await service.forgotPassword({
        email: "active@example.com",
      });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should throw BadRequestException if token is invalid or expired", () => {
      mockDb.setSelectResult([]);
      expect(
        service.resetPassword({
          token: "invalid-token",
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if token is expired", () => {
      mockDb.setSelectResult([
        { id: "user-id", resetPasswordExpiresAt: new Date(Date.now() - 1000) },
      ]);
      expect(
        service.resetPassword({
          token: "expired-token",
          password: "NewPassword123",
          confirmPassword: "NewPassword123",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reset password, clear token, and delete active refresh tokens", async () => {
      mockDb.setSelectResult([
        {
          id: "user-id",
          resetPasswordExpiresAt: new Date(Date.now() + 100000),
        },
      ]);
      await service.resetPassword({
        token: "valid-token",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("should throw BadRequestException if user is not found", () => {
      mockDb.setSelectResult([]);
      expect(
        service.changePassword("user-id", {
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword456!",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if OAuth user has no passwordHash", () => {
      mockDb.setSelectResult([{ id: "user-id", passwordHash: null }]);
      expect(
        service.changePassword("user-id", {
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword456!",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw UnauthorizedException if currentPassword is invalid", async () => {
      const hashedOldPassword = await hashPassword("RealOldPassword123!");
      mockDb.setSelectResult([
        { id: "user-id", passwordHash: hashedOldPassword },
      ]);

      expect(
        service.changePassword("user-id", {
          currentPassword: "WrongOldPassword123!",
          newPassword: "NewPassword456!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException if newPassword is identical to currentPassword", async () => {
      const hashedOldPassword = await hashPassword("SamePassword123!");
      mockDb.setSelectResult([
        { id: "user-id", passwordHash: hashedOldPassword },
      ]);

      expect(
        service.changePassword("user-id", {
          currentPassword: "SamePassword123!",
          newPassword: "SamePassword123!",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should change password and delete refresh tokens on success", async () => {
      const hashedOldPassword = await hashPassword("OldPassword123!");
      mockDb.setSelectResult([
        { id: "user-id", passwordHash: hashedOldPassword },
      ]);

      await service.changePassword("user-id", {
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword456!",
      });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
