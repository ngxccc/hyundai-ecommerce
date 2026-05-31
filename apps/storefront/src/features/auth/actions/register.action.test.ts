import { beforeEach, describe, expect, it, vi } from "bun:test";
import {
  AUTH_ERROR_CODES,
  SYSTEM_ERROR_CODES,
} from "@nhatnang/shared/constants";
import type { TActionResult } from "@nhatnang/types";

// ---------------------------------------------------------------------------
// Mocks — system boundaries only
// ---------------------------------------------------------------------------

const mockRegister = vi.fn();
const mockCheckDuplicateUser = vi.fn();

void vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: vi.fn(),
    register: mockRegister,
  },
  userService: {
    checkDuplicateUser: mockCheckDuplicateUser,
  },
}));

// Dynamic import AFTER mocks are registered
const { registerAction } = await import("./register.action");

// ---------------------------------------------------------------------------
// Result type for the action (validation error branch + authService branch)
// ---------------------------------------------------------------------------

interface IValidationErrorResult {
  success: false;
  code: string;
  fieldErrors: Record<string, string[] | undefined>;
}

type TActionSuccessResult = TActionResult<{ userId: string }>;

type TRegisterActionResult =
  | IValidationErrorResult
  | TActionSuccessResult
  | TActionResult;

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const validEndUser = {
  name: "Nguyen Van A",
  email: "a@example.com",
  phone: "0901234567",
  password: "password123",
  confirmPassword: "password123",
  businessType: "end_user" as const,
  agreeTerms: true,
};

const validDealer = {
  ...validEndUser,
  businessType: "dealer" as const,
  companyName: "ABC Corp",
  taxId: "12345678",
  province: "Ho Chi Minh",
};

// ---------------------------------------------------------------------------
// Assertion helpers — avoid repeated cast + narrowing boilerplate
// ---------------------------------------------------------------------------

const assertValidationError = (
  result: TRegisterActionResult,
): IValidationErrorResult => {
  expect(result.success).toBe(false);
  const validationResult = result as IValidationErrorResult;
  expect(validationResult.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
  return validationResult;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("registerAction", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockCheckDuplicateUser.mockReset();
    mockCheckDuplicateUser.mockResolvedValue(undefined);
  });

  // ── Validation: basic fields ────────────────────────────────────────────

  it("returns VALIDATION_ERROR when name is too short", async () => {
    const result = (await registerAction({
      ...validEndUser,
      name: "A",
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["name"]).toBeDefined();
    expect(validationResult.fieldErrors["name"]!.length).toBeGreaterThan(0);
    expect(mockCheckDuplicateUser).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when email format is invalid", async () => {
    const result = (await registerAction({
      ...validEndUser,
      email: "xxx",
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["email"]).toBeDefined();
    expect(mockCheckDuplicateUser).not.toHaveBeenCalled();
  });

  it("returns VALIDATION_ERROR when phone has fewer than 10 characters", async () => {
    const result = (await registerAction({
      ...validEndUser,
      phone: "0901",
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["phone"]).toBeDefined();
  });

  it("returns VALIDATION_ERROR when password is shorter than 6 characters", async () => {
    const result = (await registerAction({
      ...validEndUser,
      password: "12345",
      confirmPassword: "12345",
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["password"]).toBeDefined();
  });

  it("returns VALIDATION_ERROR when confirmPassword does not match password", async () => {
    const result = (await registerAction({
      ...validEndUser,
      confirmPassword: "wrong-password",
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["confirmPassword"]).toBeDefined();
  });

  it("returns VALIDATION_ERROR when agreeTerms is false", async () => {
    const result = (await registerAction({
      ...validEndUser,
      agreeTerms: false,
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["agreeTerms"]).toBeDefined();
  });

  // ── Validation: business customer conditional fields ────────────────────

  it("returns VALIDATION_ERROR when dealer has no companyName", async () => {
    const result = (await registerAction({
      ...validDealer,
      companyName: undefined,
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["companyName"]).toBeDefined();
  });

  it("returns VALIDATION_ERROR when dealer has no taxId", async () => {
    const result = (await registerAction({
      ...validDealer,
      taxId: undefined,
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["taxId"]).toBeDefined();
  });

  it("returns VALIDATION_ERROR when dealer has no province", async () => {
    const result = (await registerAction({
      ...validDealer,
      province: undefined,
    })) as TRegisterActionResult;

    const validationResult = assertValidationError(result);
    expect(validationResult.fieldErrors["province"]).toBeDefined();
  });

  // ── Duplicate user detection ────────────────────────────────────────────

  it("returns EMAIL_ALREADY_EXISTS when email is duplicate", async () => {
    mockCheckDuplicateUser.mockResolvedValue({
      email: validEndUser.email,
      phone: "0999999999",
    });

    const result = (await registerAction(
      validEndUser,
    )) as IValidationErrorResult;

    expect(result.success).toBe(false);
    expect(result.fieldErrors["email"]).toContain(
      AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    );
    expect(result.fieldErrors["phone"]).toBeUndefined();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("returns PHONE_ALREADY_EXISTS when phone is duplicate", async () => {
    mockCheckDuplicateUser.mockResolvedValue({
      email: "other@example.com",
      phone: validEndUser.phone,
    });

    const result = (await registerAction(
      validEndUser,
    )) as IValidationErrorResult;

    expect(result.success).toBe(false);
    expect(result.fieldErrors["phone"]).toContain(
      AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS,
    );
    expect(result.fieldErrors["email"]).toBeUndefined();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("returns both field errors when email and phone are duplicate", async () => {
    mockCheckDuplicateUser.mockResolvedValue({
      email: validEndUser.email,
      phone: validEndUser.phone,
    });

    const result = (await registerAction(
      validEndUser,
    )) as IValidationErrorResult;

    expect(result.success).toBe(false);
    expect(result.fieldErrors["email"]).toContain(
      AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    );
    expect(result.fieldErrors["phone"]).toContain(
      AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS,
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Service delegation ──────────────────────────────────────────────────

  it("delegates to authService.register with validated data when no duplicate", async () => {
    const serviceResult = { userId: "user-new" };
    mockRegister.mockResolvedValue(serviceResult);

    await registerAction(validEndUser);

    expect(mockCheckDuplicateUser).toHaveBeenCalledWith(
      validEndUser.email,
      validEndUser.phone,
    );
    expect(mockRegister).toHaveBeenCalledTimes(1);

    const calledWith = mockRegister.mock.calls[0] as unknown[];
    const calledData = calledWith[0] as Record<string, unknown>;
    expect(calledData["email"]).toBe(validEndUser.email);
    expect(calledData["name"]).toBe(validEndUser.name);
    expect(calledData["phone"]).toBe(validEndUser.phone);
    expect(calledData["businessType"]).toBe(validEndUser.businessType);
  });

  it("returns success result from authService", async () => {
    const serviceResult = { userId: "user-789" };
    mockRegister.mockResolvedValue(serviceResult);

    const result = (await registerAction(validEndUser)) as TActionSuccessResult;

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected registerAction to succeed");
    }

    expect(result.data.userId).toBe("user-789");
  });

  it("forwards error result from authService", async () => {
    mockRegister.mockRejectedValue(new Error("errors.INTERNAL_SERVER_ERROR"));

    const result = (await registerAction(validEndUser)) as TActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected registerAction to fail");
    }

    expect(result.error).toBe("translated.INTERNAL_SERVER_ERROR");
  });
});
