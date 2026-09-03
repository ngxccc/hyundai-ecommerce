import { describe, expect, it, spyOn } from "bun:test";
import { authService, userService } from "@nhatnang/database/services";
import {
  AUTH_ERROR_CODES,
  SYSTEM_ERROR_CODES,
} from "@nhatnang/shared/constants";
import type { ActionResult } from "@nhatnang/shared";
import { registerAction } from "./register.action";

type RegisterActionResult = Awaited<ReturnType<typeof registerAction>>;

const validEndUser = {
  name: "Nguyen Van A",
  email: "a@example.com",
  phone: "0901234567",
  password: "password123",
  confirmPassword: "password123",
  businessType: "END_USER" as const,
  agreeTerms: true,
};

const validDealer = {
  ...validEndUser,
  businessType: "DEALER" as const,
  companyName: "ABC Corp",
  taxId: "12345678",
  province: "Ho Chi Minh",
};

const assertValidationError = (result: RegisterActionResult) => {
  expect(result.success).toBe(false);
  if (result.success || !("fieldErrors" in result) || !result.fieldErrors) {
    throw new Error("Expected validation error with fieldErrors");
  }
  expect(result.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
  return result as {
    success: false;
    code: string;
    fieldErrors: Record<string, string[] | undefined>;
  };
};

describe("registerAction", () => {
  // ── Validation: Required Fields ──────────────────────────────────────────

  it("returns VALIDATION_ERROR when name is too short", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({ ...validEndUser, name: "A" });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["name"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when email format is invalid", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validEndUser,
      email: "invalid-email",
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["email"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when phone has fewer than 10 characters", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validEndUser,
      phone: "123456789",
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["phone"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when password is shorter than 6 characters", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validEndUser,
      password: "123",
      confirmPassword: "123",
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["password"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when confirmPassword does not match password", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validEndUser,
      password: "password123",
      confirmPassword: "differentPassword456",
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["confirmPassword"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when agreeTerms is false", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validEndUser,
      agreeTerms: false,
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["agreeTerms"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  // ── Validation: Conditional Dealer Fields (superRefine) ──────────────────

  it("returns VALIDATION_ERROR when dealer has no companyName", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validDealer,
      companyName: undefined,
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["companyName"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when dealer has no taxId", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({ ...validDealer, taxId: undefined });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["taxId"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when dealer has no province", async () => {
    const registerSpy = spyOn(authService, "register");
    const result = await registerAction({
      ...validDealer,
      province: undefined,
    });
    const { fieldErrors } = assertValidationError(result);
    expect(fieldErrors["province"]).toBeDefined();
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  // ── Duplicate Checks ────────────────────────────────────────────────────

  it("returns EMAIL_ALREADY_EXISTS when email is duplicate", async () => {
    const registerSpy = spyOn(authService, "register");
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue({
      email: validEndUser.email,
      phone: "0999999999",
    });

    const result = await registerAction(validEndUser);
    const { fieldErrors } = assertValidationError(result);

    expect(fieldErrors["email"]).toContain(
      AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    );
    expect(fieldErrors["phone"]).toBeUndefined();
    expect(registerSpy).not.toHaveBeenCalled();

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });

  it("returns PHONE_ALREADY_EXISTS when phone is duplicate", async () => {
    const registerSpy = spyOn(authService, "register");
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue({
      email: "other@example.com",
      phone: validEndUser.phone,
    });

    const result = await registerAction(validEndUser);
    const { fieldErrors } = assertValidationError(result);

    expect(fieldErrors["phone"]).toContain(
      AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS,
    );
    expect(fieldErrors["email"]).toBeUndefined();
    expect(registerSpy).not.toHaveBeenCalled();

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });

  it("returns both field errors when email and phone are duplicate", async () => {
    const registerSpy = spyOn(authService, "register");
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue({
      email: validEndUser.email,
      phone: validEndUser.phone,
    });

    const result = await registerAction(validEndUser);
    const { fieldErrors } = assertValidationError(result);

    expect(fieldErrors["email"]).toContain(
      AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
    );
    expect(fieldErrors["phone"]).toContain(
      AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS,
    );
    expect(registerSpy).not.toHaveBeenCalled();

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });

  // ── Service delegation ──────────────────────────────────────────────────

  it("delegates to authService.register with validated data when no duplicate", async () => {
    const registerSpy = spyOn(authService, "register").mockResolvedValue({
      userId: "user-new",
    });
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue(undefined);

    await registerAction(validEndUser);

    expect(checkDuplicateSpy).toHaveBeenCalledWith(
      validEndUser.email,
      validEndUser.phone,
    );
    expect(registerSpy).toHaveBeenCalledTimes(1);

    const calledWith = registerSpy.mock.calls[0] as unknown[];
    const calledData = calledWith[0] as Record<string, unknown>;
    expect(calledData["email"]).toBe(validEndUser.email);
    expect(calledData["name"]).toBe(validEndUser.name);
    expect(calledData["phone"]).toBe(validEndUser.phone);
    expect(calledData["businessType"]).toBe(validEndUser.businessType);

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });

  it("returns success result from authService", async () => {
    const registerSpy = spyOn(authService, "register").mockResolvedValue({
      userId: "user-789",
    });
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue(undefined);

    const result = await registerAction(validEndUser);

    expect(result.success).toBe(true);

    if (!result.success || !("data" in result)) {
      throw new Error("Expected registerAction to succeed");
    }

    expect(result.data.userId).toBe("user-789");

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });

  it("forwards error result from authService", async () => {
    const registerSpy = spyOn(authService, "register").mockRejectedValue(
      new Error("errors.INTERNAL_SERVER_ERROR"),
    );
    const checkDuplicateSpy = spyOn(
      userService,
      "checkDuplicateUser",
    ).mockResolvedValue(undefined);

    const result = (await registerAction(validEndUser)) as ActionResult;

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected registerAction to fail");
    }

    expect(result.error).toBe("INTERNAL_SERVER_ERROR");

    registerSpy.mockRestore();
    checkDuplicateSpy.mockRestore();
  });
});
