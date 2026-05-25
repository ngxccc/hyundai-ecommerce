import { expect, test, describe, mock, vi, beforeEach } from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { adminLoginAction } from "./admin-login.action";

// Mock at system boundaries
vi.mock("next/headers", () => ({
  headers: mock(async () => new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: mock(),
  },
}));

type LoginResult = Awaited<ReturnType<typeof adminLoginAction>>;

describe("adminLoginAction", () => {
  let authServiceMock: any;

  beforeEach(async () => {
    const { authService } = await import("@nhatnang/database/services");
    authServiceMock = authService;
    authServiceMock.loginEmail.mockClear();
  });

  test("returns validation error when input is invalid (empty)", async () => {
    const { adminLoginAction } = await import("./admin-login.action");

    // @ts-expect-error - testing invalid input
    const result = await adminLoginAction({});

    expect(result.success).toBe(false);
    expect(result.success === false && result.code).toBe(
      SYSTEM_ERROR_CODES.VALIDATION_ERROR,
    );
    expect(result).toHaveProperty("fieldErrors");
    expect(authServiceMock.loginEmail).not.toHaveBeenCalled();
  });

  test("calls authService.loginEmail and returns its result when input is valid", async () => {
    const { adminLoginAction } = await import("./admin-login.action");
    const { headers } = await import("next/headers");

    const mockSuccessResponse: LoginResult = {
      success: true,
      data: { userId: "1" },
    };
    authServiceMock.loginEmail.mockResolvedValueOnce(mockSuccessResponse);

    const validData = {
      email: "admin@example.com",
      password: "Password123!",
      rememberMe: true,
    };

    const result = await adminLoginAction(validData);

    expect(authServiceMock.loginEmail).toHaveBeenCalledTimes(1);
    expect(authServiceMock.loginEmail).toHaveBeenCalledWith(
      {
        email: validData.email,
        password: validData.password,
      },
      { headers: await headers() },
    );
    expect(result).toEqual(mockSuccessResponse);
  });
});
