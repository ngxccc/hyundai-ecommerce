import { describe, expect, it, spyOn } from "bun:test";
import { authService } from "@nhatnang/database/services";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { ActionResult } from "@nhatnang/shared";
import { loginAction } from "./login.action";

describe("loginAction", () => {
  // ── Validation ──────────────────────────────────────────────────────────

  it("returns VALIDATION_ERROR when email is empty", async () => {
    const loginSpy = spyOn(authService, "loginEmail");
    const result = await loginAction({
      email: "",
      password: "123456",
    });

    expect(result.success).toBe(false);

    if (result.success || !("fieldErrors" in result) || !result.fieldErrors) {
      throw new Error("Expected validation error with fieldErrors");
    }

    expect(result.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(result.fieldErrors["email"]).toBeDefined();
    expect(result.fieldErrors["email"]?.length).toBeGreaterThan(0);
    expect(loginSpy).not.toHaveBeenCalled();
    loginSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when password is empty", async () => {
    const loginSpy = spyOn(authService, "loginEmail");
    const result = await loginAction({
      email: "test@example.com",
      password: "",
    });

    expect(result.success).toBe(false);

    if (result.success || !("fieldErrors" in result) || !result.fieldErrors) {
      throw new Error("Expected validation error with fieldErrors");
    }

    expect(result.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(result.fieldErrors["password"]).toBeDefined();
    expect(result.fieldErrors["password"]?.length).toBeGreaterThan(0);
    expect(loginSpy).not.toHaveBeenCalled();
    loginSpy.mockRestore();
  });

  it("returns VALIDATION_ERROR when email format is invalid", async () => {
    const loginSpy = spyOn(authService, "loginEmail");
    const result = await loginAction({
      email: "not-an-email",
      password: "validPassword123",
    });

    expect(result.success).toBe(false);

    if (result.success || !("fieldErrors" in result) || !result.fieldErrors) {
      throw new Error("Expected validation error with fieldErrors");
    }

    expect(result.code).toBe(SYSTEM_ERROR_CODES.VALIDATION_ERROR);
    expect(result.fieldErrors["email"]).toBeDefined();
    expect(loginSpy).not.toHaveBeenCalled();
    loginSpy.mockRestore();
  });

  // ── Service delegation ──────────────────────────────────────────────────

  it("delegates to authService.loginEmail with parsed data and headers", async () => {
    const loginSpy = spyOn(authService, "loginEmail").mockResolvedValue({
      userId: "user-123",
    });

    await loginAction({ email: "valid@example.com", password: "secure123" });

    expect(loginSpy).toHaveBeenCalledTimes(1);
    loginSpy.mockRestore();
  });

  it("returns success result from authService", async () => {
    const loginSpy = spyOn(authService, "loginEmail").mockResolvedValue({
      userId: "user-456",
    });

    const result = (await loginAction({
      email: "valid@example.com",
      password: "secure123",
    })) as ActionResult<{ userId: string }>;

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected loginAction to succeed");
    }

    expect(result.data.userId).toBe("user-456");
    loginSpy.mockRestore();
  });

  it("forwards error result from authService", async () => {
    const loginSpy = spyOn(authService, "loginEmail").mockRejectedValue(
      new Error("errors.INVALID_CREDENTIALS"),
    );

    const result = await loginAction({
      email: "valid@example.com",
      password: "wrong-password",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected loginAction to fail");
    }

    expect("error" in result ? result.error : null).toBe("INVALID_CREDENTIALS");
    loginSpy.mockRestore();
  });
});
