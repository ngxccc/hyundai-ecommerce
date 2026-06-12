import { beforeEach, describe, expect, it } from "bun:test";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import { AuthService } from "./auth.service";
import { mockDb } from "../../tests/utils/db-mock";
import type { IDatabase } from "../../client";
import { mockSignInEmail, mockSignUpEmail } from "../../tests/utils/auth-mock";

interface IAuthErrorLike {
  isAPIError?: boolean;
  body: {
    code?: string;
  };
  message?: string;
}

const createApiError = (code: string, message: string): IAuthErrorLike => {
  const err = new Error(message) as unknown as IAuthErrorLike;
  err.isAPIError = true;
  err.body = { code };
  return err;
};

const authService = new AuthService(mockDb as unknown as IDatabase);

describe("AuthService", () => {
  beforeEach(() => {
    mockSignInEmail.mockReset();
    mockSignUpEmail.mockReset();
  });

  it("loginEmail returns userId on success", async () => {
    mockSignInEmail.mockResolvedValue({ user: { id: "user-1" } });

    const res = await authService.loginEmail({
      email: "a@x.com",
      password: "p",
    });

    expect(res).toEqual({ userId: "user-1" });
  });

  it("loginEmail returns INVALID_CREDENTIALS when Better Auth throws API error", () => {
    mockSignInEmail.mockRejectedValue(
      createApiError("INVALID_EMAIL_OR_PASSWORD", "Invalid credentials"),
    );

    expect(
      authService.loginEmail({
        email: "a@x.com",
        password: "p",
      }),
    ).rejects.toThrow("errors.INVALID_CREDENTIALS");
  });

  it("loginEmail returns EMAIL_NOT_VERIFIED when Better Auth rejects unverified email", () => {
    mockSignInEmail.mockRejectedValue(
      createApiError("EMAIL_NOT_VERIFIED", "Email not verified"),
    );

    expect(
      authService.loginEmail({
        email: "a@x.com",
        password: "p",
      }),
    ).rejects.toThrow("errors.EMAIL_NOT_VERIFIED");
  });

  it("loginEmail returns ACCOUNT_LOCKED when account is locked", async () => {
    mockSignInEmail.mockRejectedValue(
      createApiError(AUTH_ERROR_CODES.ACCOUNT_LOCKED, "Account locked"),
    );

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await expect(
      authService.loginEmail({
        email: "a@x.com",
        password: "p",
      }),
    ).rejects.toThrow(`errors.${AUTH_ERROR_CODES.ACCOUNT_LOCKED}`);
  });

  it("register returns userId on success", async () => {
    mockSignUpEmail.mockResolvedValue({ user: { id: "user-2" } });

    const res = await authService.register({
      email: "b@x.com",
      password: "p",
      name: "Name",
      phone: "0123",
      confirmPassword: "p",
      businessType: "dealer",
      agreeTerms: true,
      companyName: "Company",
      taxId: "12345678",
      province: "Hanoi",
    });

    expect(res).toEqual({ userId: "user-2" });
  });

  it("register returns INVALID_CREDENTIALS when Better Auth throws API error", () => {
    const err = new Error("exists");
    (err as unknown as IAuthErrorLike).isAPIError = true;
    mockSignUpEmail.mockRejectedValue(err);

    expect(
      authService.register({
        email: "b@x.com",
        password: "p",
        name: "Name",
        phone: "0123",
        confirmPassword: "p",
        businessType: "dealer",
        agreeTerms: true,
        companyName: "Company",
        taxId: "12345678",
        province: "Hanoi",
      }),
    ).rejects.toThrow("errors.INVALID_CREDENTIALS");
  });
});
