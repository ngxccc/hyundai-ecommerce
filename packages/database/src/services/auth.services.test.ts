import { describe, it, expect, vi } from "bun:test";

interface IAuthErrorLike {
  isAPIError?: boolean;
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
    const err = new Error("invalid");
    // mark it as API error according to the mock's isAPIError predicate
    (err as IAuthErrorLike).isAPIError = true;
    mockSignInEmail.mockRejectedValue(err);

    const res = await authService.loginEmail({
      email: "a@x.com",
      password: "p",
    });

    expect(res.success).toBe(false);

    if (res.success) {
      throw new Error("Expected loginEmail to fail");
    }

    expect(res.code).toBe("INVALID_CREDENTIALS");
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
