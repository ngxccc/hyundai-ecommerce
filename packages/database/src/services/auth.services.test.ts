import { beforeEach, describe, expect, it, vi } from "bun:test";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";

interface IAuthErrorLike {
  isAPIError?: boolean;
  code?: string;
  message?: string;
}

const isAuthErrorLike = (error: unknown): error is IAuthErrorLike => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAPIError" in error &&
    Boolean((error as IAuthErrorLike).isAPIError)
  );
};

const mockSignInEmail = vi.fn();
const mockSignUpEmail = vi.fn();

const createApiError = (code: string, message: string): IAuthErrorLike => {
  return {
    isAPIError: true,
    code,
    message,
  };
};

void vi.mock("../auth", () => {
  return {
    auth: {
      api: { signInEmail: mockSignInEmail, signUpEmail: mockSignUpEmail },
    },
    isAPIError: isAuthErrorLike,
  };
});

const { authService } = await import(".");

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

    expect(res.success).toBe(true);

    if (!res.success) {
      throw new Error("Expected loginEmail to succeed");
    }

    expect(res.data.userId).toBe("user-1");
  });

  it("loginEmail returns INVALID_CREDENTIALS when Better Auth throws API error", async () => {
    mockSignInEmail.mockRejectedValue(
      createApiError("INVALID_EMAIL_OR_PASSWORD", "Invalid credentials"),
    );

    const res = await authService.loginEmail({
      email: "a@x.com",
      password: "p",
    });

    expect(res.success).toBe(false);

    if (res.success) {
      throw new Error("Expected loginEmail to fail");
    }

    expect(res.code).toBe("INVALID_CREDENTIALS");
    expect(res.error).toBe("Invalid credentials");
  });

  it("loginEmail returns EMAIL_NOT_VERIFIED when Better Auth rejects unverified email", async () => {
    mockSignInEmail.mockRejectedValue(
      createApiError("EMAIL_NOT_VERIFIED", "Email not verified"),
    );

    const res = await authService.loginEmail({
      email: "a@x.com",
      password: "p",
    });

    expect(res.success).toBe(false);

    if (res.success) {
      throw new Error("Expected loginEmail to fail");
    }

    expect(res.code).toBe("EMAIL_NOT_VERIFIED");
    expect(res.error).toBe("Email not verified");
  });

  it("loginEmail returns ACCOUNT_LOCKED when account is locked", async () => {
    mockSignInEmail.mockRejectedValue(
      createApiError(AUTH_ERROR_CODES.ACCOUNT_LOCKED, "Account locked"),
    );

    const res = await authService.loginEmail({
      email: "a@x.com",
      password: "p",
    });

    expect(res.success).toBe(false);

    if (res.success) {
      throw new Error("Expected loginEmail to fail");
    }

    expect(res.code).toBe(AUTH_ERROR_CODES.ACCOUNT_LOCKED);
    expect(res.error).toBe("Account locked");
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

    expect(res.success).toBe(true);

    if (!res.success) {
      throw new Error("Expected register to succeed");
    }

    expect(res.data.userId).toBe("user-2");
  });

  it("register returns INVALID_CREDENTIALS when Better Auth throws API error", async () => {
    const err = new Error("exists");
    (err as IAuthErrorLike).isAPIError = true;
    mockSignUpEmail.mockRejectedValue(err);

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

    expect(res.success).toBe(false);

    if (res.success) {
      throw new Error("Expected register to fail");
    }

    expect(res.code).toBe("INVALID_CREDENTIALS");
  });
});
