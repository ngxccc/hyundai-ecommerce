import { beforeEach, describe, expect, mock, test } from "bun:test";
import { adminLoginAction } from "./admin-login.action";
import { authApi } from "@/features/auth/api/auth.api";
import { _resetRateLimitStore } from "@/lib/rate-limiter";
import { TIME_IN_SECONDS } from "@/constants/time.constant";

// Mock next/headers module for Next.js Server Action execution
const mockCookieStore = {
  set: mock((_name: string, _value: string, _options: unknown) => undefined),
  get: mock((_name: string) => undefined),
  delete: mock((_name: string) => undefined),
};

void mock.module("next/headers", () => ({
  cookies: () => Promise.resolve(mockCookieStore),
  headers: () =>
    Promise.resolve({
      get: (key: string) => (key === "x-forwarded-for" ? "127.0.0.1" : null),
    }),
}));

void mock.module("next-intl/server", () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}));

describe("AdminAuth Action", () => {
  describe("adminLoginAction()", () => {
    beforeEach(() => {
      _resetRateLimitStore();
      mockCookieStore.set.mockClear();
    });

    describe("when rememberMe is enabled", () => {
      test("should issue login request with only email and password and set 30-day session cookie", async () => {
        const mockAuthResponse = {
          data: {
            data: {
              accessToken: "mock-access-token",
              refreshToken: "mock-refresh-token",
              user: {
                id: "admin-uuid-1",
                email: "admin@hyundai-nhatnang.vn",
                fullName: "Super Admin",
                role: "ADMIN",
              },
            },
          },
          error: undefined,
        };

        let payloadSentToBackend: unknown = null;
        const originalLogin = authApi.login;
        authApi.login = mock((body) => {
          payloadSentToBackend = body;
          return Promise.resolve(mockAuthResponse as never);
        });

        const result = await adminLoginAction({
          email: "admin@hyundai-nhatnang.vn",
          password: "SuperSecretPassword123!",
          rememberMe: true,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.accessToken).toBe("mock-access-token");
        }

        // Contract Assertion: ONLY email and password sent to backend (NO rememberMe forwarded)
        expect(payloadSentToBackend).toEqual({
          email: "admin@hyundai-nhatnang.vn",
          password: "SuperSecretPassword123!",
        });
        expect(payloadSentToBackend).not.toHaveProperty("rememberMe");

        // Contract Assertion: 30-day cookie maxAge
        expect(mockCookieStore.set).toHaveBeenCalledTimes(3);
        const tokenCall = mockCookieStore.set.mock.calls.find(
          (call) => call[0] === "adminAccessToken",
        );
        expect(tokenCall).toBeDefined();
        expect(tokenCall?.[2]).toMatchObject({
          maxAge: 30 * TIME_IN_SECONDS.DAY,
          httpOnly: true,
        });

        authApi.login = originalLogin;
      });
    });

    describe("when rememberMe is disabled", () => {
      test("should issue login request and set 24-hour session cookie", async () => {
        const mockAuthResponse = {
          data: {
            data: {
              accessToken: "mock-access-token",
              refreshToken: "mock-refresh-token",
              user: {
                id: "admin-uuid-1",
                email: "admin@hyundai-nhatnang.vn",
                fullName: "Super Admin",
                role: "ADMIN",
              },
            },
          },
          error: undefined,
        };

        const originalLogin = authApi.login;
        authApi.login = mock(() => Promise.resolve(mockAuthResponse as never));

        const result = await adminLoginAction({
          email: "admin@hyundai-nhatnang.vn",
          password: "SuperSecretPassword123!",
          rememberMe: false,
        });

        expect(result.success).toBe(true);

        // Contract Assertion: 24-hour cookie maxAge
        const tokenCall = mockCookieStore.set.mock.calls.find(
          (call) => call[0] === "adminAccessToken",
        );
        expect(tokenCall?.[2]).toMatchObject({
          maxAge: TIME_IN_SECONDS.DAY,
          httpOnly: true,
        });

        authApi.login = originalLogin;
      });
    });

    describe("when payload validation fails", () => {
      test("should reject invalid email format without calling backend API", async () => {
        let backendCalled = false;
        const originalLogin = authApi.login;
        authApi.login = mock(() => {
          backendCalled = true;
          return Promise.resolve({} as never);
        });

        const result = await adminLoginAction({
          email: "invalid-email-format",
          password: "validPassword123!",
          rememberMe: false,
        });

        expect(result.success).toBe(false);
        expect(backendCalled).toBe(false);
        if (!result.success && "fieldErrors" in result) {
          expect(result.fieldErrors?.email).toBeDefined();
        }

        authApi.login = originalLogin;
      });

      test("should reject empty password without calling backend API", async () => {
        let backendCalled = false;
        const originalLogin = authApi.login;
        authApi.login = mock(() => {
          backendCalled = true;
          return Promise.resolve({} as never);
        });

        const result = await adminLoginAction({
          email: "admin@hyundai-nhatnang.vn",
          password: "",
          rememberMe: false,
        });

        expect(result.success).toBe(false);
        expect(backendCalled).toBe(false);
        if (!result.success && "fieldErrors" in result) {
          expect(result.fieldErrors?.password).toBeDefined();
        }

        authApi.login = originalLogin;
      });
    });

    describe("when backend returns validation error with invalidParams", () => {
      test("should map invalidParams to fieldErrors", async () => {
        const originalLogin = authApi.login;
        authApi.login = mock(() =>
          Promise.resolve({
            data: undefined,
            error: {
              status: 400,
              detail: "Dữ liệu gửi lên không đúng định dạng",
              invalidParams: [
                {
                  name: "password",
                  reason: "Mật khẩu phải có tối thiểu 8 ký tự",
                },
              ],
            },
          } as never),
        );

        const result = await adminLoginAction({
          email: "admin@hyundai-nhatnang.vn",
          password: "password123",
          rememberMe: false,
        });

        expect(result.success).toBe(false);
        if (!result.success && "fieldErrors" in result) {
          expect(result.fieldErrors?.password).toEqual([
            "Mật khẩu phải có tối thiểu 8 ký tự",
          ]);
        }

        authApi.login = originalLogin;
      });
    });

    describe("when backend returns authentication failure", () => {
      test("should return error detail gracefully", async () => {
        const originalLogin = authApi.login;
        authApi.login = mock(() =>
          Promise.resolve({
            data: undefined,
            error: { detail: "Email hoặc mật khẩu không chính xác" },
          } as never),
        );

        const result = await adminLoginAction({
          email: "admin@hyundai-nhatnang.vn",
          password: "WrongPassword123!",
          rememberMe: false,
        });

        expect(result.success).toBe(false);
        if (!result.success && "error" in result) {
          expect(result.error).toBe("Email hoặc mật khẩu không chính xác");
        }

        authApi.login = originalLogin;
      });
    });
  });
});
