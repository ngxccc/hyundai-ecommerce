import { beforeEach, describe, expect, it, vi } from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { TAuthActionResult } from "@nhatnang/types";

// ---------------------------------------------------------------------------
// Mocks — system boundaries only
// ---------------------------------------------------------------------------

const mockLoginEmail = vi.fn();
const mockHeaders = vi.fn();

void vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: mockLoginEmail,
    register: vi.fn(),
  },
  userService: {
    checkDuplicateUser: vi.fn(),
  },
}));

void vi.mock("next/headers", () => ({
  headers: mockHeaders,
}));

// Dynamic import AFTER mocks are registered
const { loginAction } = await import("./login.action");

// ---------------------------------------------------------------------------
// Result type for the action (validation error branch + authService branch)
// ---------------------------------------------------------------------------

interface IValidationErrorResult {
  success: false;
  code: string;
  fieldErrors: Record<string, string[] | undefined>;
}

type TLoginActionResult =
  | IValidationErrorResult
  | TAuthActionResult<{ userId: string }>;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("loginAction", () => {
  const fakeHeaders = new Headers({ "x-test": "1" });

  beforeEach(() => {
    mockLoginEmail.mockReset();
    mockHeaders.mockReset();
    mockHeaders.mockResolvedValue(fakeHeaders);
  });

  // ── Validation ──────────────────────────────────────────────────────────

  it("returns VALIDATION_ERROR when email is empty", async () => {
    const result = (await loginAction({
      email: "",
      password: "123456",
    })) as TLoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as IValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors["email"]).toBeDefined();
    expect(validationResult.fieldErrors["email"]!.length).toBeGreaterThan(0);
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when password is empty", async () => {
    const result = (await loginAction({
      email: "test@example.com",
      password: "",
    })) as TLoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as IValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors["password"]).toBeDefined();
    expect(validationResult.fieldErrors["password"]!.length).toBeGreaterThan(0);
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when email format is invalid", async () => {
    const result = (await loginAction({
      email: "not-an-email",
      password: "123456",
    })) as TLoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as IValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors["email"]).toBeDefined();
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  // ── Service delegation ──────────────────────────────────────────────────

  it("delegates to authService.loginEmail with parsed data and headers", async () => {
    const serviceResult: TAuthActionResult<{ userId: string }> = {
      success: true,
      data: { userId: "user-123" },
    };
    mockLoginEmail.mockResolvedValue(serviceResult);

    await loginAction({ email: "valid@example.com", password: "secure123" });

    expect(mockLoginEmail).toHaveBeenCalledTimes(1);
    expect(mockLoginEmail).toHaveBeenCalledWith(
      { email: "valid@example.com", password: "secure123" },
      { headers: fakeHeaders },
    );
  });

  it("returns success result from authService", async () => {
    const serviceResult: TAuthActionResult<{ userId: string }> = {
      success: true,
      data: { userId: "user-456" },
    };
    mockLoginEmail.mockResolvedValue(serviceResult);

    const result = (await loginAction({
      email: "valid@example.com",
      password: "secure123",
    })) as TAuthActionResult<{ userId: string }>;

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected loginAction to succeed");
    }

    expect(result.data.userId).toBe("user-456");
  });

  it("forwards error result from authService", async () => {
    const serviceError: TAuthActionResult<{ userId: string }> = {
      success: false,
      code: "INVALID_CREDENTIALS",
      error: "Invalid email or password",
    };
    mockLoginEmail.mockResolvedValue(serviceError);

    const result = (await loginAction({
      email: "valid@example.com",
      password: "wrong-password",
    })) as TAuthActionResult<{ userId: string }>;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    expect(result.code).toBe("INVALID_CREDENTIALS");
    expect(result.error).toBe("Invalid email or password");
  });
});
