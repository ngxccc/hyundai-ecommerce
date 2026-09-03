import type { Request } from "express";
import { AuthController } from "./auth.controller";
import type { AuthService } from "./auth.service";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyEmailDto,
} from "./dto";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: mock(() => Promise.resolve()),
    login: mock((dto: LoginDto) =>
      Promise.resolve({
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
        user: {
          id: "mock_user_id",
          email: dto.email,
          fullName: "Test User",
          role: "user" as const,
        },
      }),
    ),
    refreshToken: mock((_dto: RefreshTokenDto) =>
      Promise.resolve({
        accessToken: "mock_access_token_renewed",
        refreshToken: "mock_refresh_token_renewed",
      }),
    ),
    verifyEmail: mock((_token: string) => Promise.resolve()),
    logout: mock((_dto: RefreshTokenDto) => Promise.resolve()),
    forgotPassword: mock(() => Promise.resolve()),
    resetPassword: mock(() => Promise.resolve()),
    changePassword: mock(() => Promise.resolve()),
    logoutAll: mock(() => Promise.resolve()),
    resendVerificationEmail: mock(() => Promise.resolve()),
  };

  beforeEach(() => {
    mockAuthService.register.mockClear();
    mockAuthService.login.mockClear();
    mockAuthService.refreshToken.mockClear();
    mockAuthService.verifyEmail.mockClear();
    mockAuthService.logout.mockClear();
    mockAuthService.forgotPassword.mockClear();
    mockAuthService.resetPassword.mockClear();
    mockAuthService.resendVerificationEmail.mockClear();
    mockAuthService.changePassword.mockClear();
    mockAuthService.logoutAll.mockClear();

    controller = new AuthController(mockAuthService as unknown as AuthService);
    authService = mockAuthService as unknown as AuthService;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call authService.register and return success-data JSON", () => {
      const dto: RegisterDto = {
        email: "test@example.com",
        fullName: "Test User",
        phoneNumber: "0912345678",
        password: "Password123",
        confirmPassword: "Password123",
        agreeTerms: true,
      };

      expect(controller.register(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe("verifyEmail", () => {
    it("should call authService.verifyEmail and return success-data JSON", () => {
      const dto: VerifyEmailDto = { token: "some-token" };
      expect(controller.verifyEmail(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("resendVerification", () => {
    it("should call authService.resendVerificationEmail and return success-data JSON", () => {
      const dto = { email: "test@example.com" };
      expect(controller.resendVerification(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(dto);
    });
  });

  describe("logout", () => {
    it("should call authService.logout and return success-data JSON", () => {
      const dto: RefreshTokenDto = {
        refreshToken: "valid_refresh_token",
      };

      expect(controller.logout(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.logout).toHaveBeenCalledWith(dto);
    });
  });

  describe("forgotPassword", () => {
    it("should call authService.forgotPassword and return success-data JSON", () => {
      const dto = { email: "test@example.com" };
      expect(controller.forgotPassword(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe("resetPassword", () => {
    it("should call authService.resetPassword and return success-data JSON", () => {
      const dto = {
        token: "token",
        password: "Password123",
        confirmPassword: "Password123",
      };
      expect(controller.resetPassword(dto)).resolves.toEqual({
        success: true,
        data: null,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe("login", () => {
    it("should extract client metadata from req and call authService.login", async () => {
      const dto = { email: "test@example.com", password: "Password123!" };
      const req = {
        headers: {
          "user-agent": "TestBrowser/1.0",
          "x-forwarded-for": "1.2.3.4",
        },
        ip: "1.2.3.4",
      } as unknown as Request;

      const result = await controller.login(dto, req);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(dto, {
        deviceName: "TestBrowser/1.0",
        ipAddress: "1.2.3.4",
      });
      expect(result).toEqual({
        success: true,
        data: {
          accessToken: "mock_access_token",
          refreshToken: "mock_refresh_token",
          user: {
            id: "mock_user_id",
            email: "test@example.com",
            fullName: "Test User",
            role: "user",
          },
        },
      });
    });
  });
  describe("refresh", () => {
    it("should extract client metadata from req and call authService.refreshToken", async () => {
      const dto = { refreshToken: "some_refresh_token" };
      const req = {
        headers: { "user-agent": "TestBrowser/1.0" },
        ip: "5.6.7.8",
      } as unknown as Request;

      const result = await controller.refresh(dto, req);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.refreshToken).toHaveBeenCalledWith(dto, {
        deviceName: "TestBrowser/1.0",
        ipAddress: "5.6.7.8",
      });
      expect(result).toEqual({
        success: true,
        data: {
          accessToken: "mock_access_token_renewed",
          refreshToken: "mock_refresh_token_renewed",
        },
      });
    });
  });
  describe("changePassword", () => {
    it("should call authService.changePassword with userId and dto", async () => {
      const dto = {
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword456!",
      };
      const result = await controller.changePassword("user-id", dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.changePassword).toHaveBeenCalledWith("user-id", dto);
      expect(result).toEqual({ success: true, data: null });
    });
  });

  describe("logoutAll", () => {
    it("should call authService.logoutAll with sub userId", async () => {
      const result = await controller.logoutAll("user-id");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.logoutAll).toHaveBeenCalledWith("user-id");
      expect(result).toEqual({ success: true, data: null });
    });
  });
});
