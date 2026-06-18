import { beforeEach, describe, expect, it, type Mock } from "bun:test";
import type { AuthService } from "@nhatnang/database/services";
import type { headers } from "next/headers";
import type { getTranslations } from "next-intl/server";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { ActionResult } from "@nhatnang/shared";

// ---------------------------------------------------------------------------
// Mocks — system boundaries only
// ---------------------------------------------------------------------------

import "@nhatnang/shared/testing/action-mocks";

// Dynamic import AFTER mocks are registered
const { loginAction } = await import("./login.action");

// ---------------------------------------------------------------------------
// Result type for the action (validation error branch + authService branch)
// ---------------------------------------------------------------------------

interface ValidationErrorResult {
  success: false;
  code: string;
  fieldErrors: {
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
  };
}

type LoginActionResult =
  | ValidationErrorResult
  | ActionResult<{ userId: string }>
  | ActionResult;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("loginAction", () => {
  const fakeHeaders = new Headers({ "x-test": "1" });
  let mockLoginEmail: Mock<AuthService["loginEmail"]>;
  let mockHeaders: Mock<typeof headers>;
  let mockGetTranslations: Mock<typeof getTranslations>;

  beforeEach(async () => {
    const { authService } = await import("@nhatnang/database/services");
    const { headers: nextHeaders } = await import("next/headers");
    const { getTranslations: nextGetTranslations } =
      await import("next-intl/server");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockLoginEmail = authService.loginEmail as Mock<
      typeof authService.loginEmail
    >;
    mockHeaders = nextHeaders as Mock<typeof nextHeaders>;
    mockGetTranslations = nextGetTranslations as Mock<
      typeof nextGetTranslations
    >;

    mockLoginEmail.mockReset();
    mockHeaders.mockReset();
    mockHeaders.mockResolvedValue(fakeHeaders);
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      ((key: string) => `translated.${key}`) as unknown as Awaited<
        ReturnType<typeof getTranslations>
      >,
    );
  });

  // ── Validation ──────────────────────────────────────────────────────────

  it("returns VALIDATION_ERROR when email is empty", async () => {
    const result = (await loginAction({
      email: "",
      password: "123456",
    })) as LoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as ValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors.email).toBeDefined();
    expect(validationResult.fieldErrors.email!.length).toBeGreaterThan(0);
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when password is empty", async () => {
    const result = (await loginAction({
      email: "test@example.com",
      password: "",
    })) as LoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as ValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors.password).toBeDefined();
    expect(validationResult.fieldErrors.password!.length).toBeGreaterThan(0);
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when email format is invalid", async () => {
    const result = (await loginAction({
      email: "not-an-email",
      password: "123456",
    })) as LoginActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    const validationResult = result as ValidationErrorResult;
    expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(validationResult.fieldErrors.email).toBeDefined();
    expect(mockLoginEmail).not.toHaveBeenCalled();
  });

  // ── Service delegation ──────────────────────────────────────────────────

  it("delegates to authService.loginEmail with parsed data and headers", async () => {
    mockLoginEmail.mockResolvedValue({ userId: "user-123" });

    await loginAction({ email: "valid@example.com", password: "secure123" });

    expect(mockLoginEmail).toHaveBeenCalledTimes(1);
    expect(mockLoginEmail).toHaveBeenCalledWith(
      { email: "valid@example.com", password: "secure123" },
      { headers: fakeHeaders },
    );
  });

  it("returns success result from authService", async () => {
    mockLoginEmail.mockResolvedValue({ userId: "user-456" });

    const result = (await loginAction({
      email: "valid@example.com",
      password: "secure123",
    })) as ActionResult<{ userId: string }>;

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected loginAction to succeed");
    }

    expect(result.data.userId).toBe("user-456");
  });

  it("forwards error result from authService", async () => {
    mockLoginEmail.mockRejectedValue(new Error("errors.INVALID_CREDENTIALS"));

    const result = await loginAction({
      email: "valid@example.com",
      password: "wrong-password",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    expect("error" in result ? result.error : null).toBe("translated.INVALID_CREDENTIALS");
  });
});
