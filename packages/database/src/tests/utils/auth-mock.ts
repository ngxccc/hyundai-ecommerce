import { vi } from "bun:test";

interface AuthErrorLike {
  isAPIError?: boolean;
  body: {
    code?: string;
  };
  message?: string;
}

export const isAuthErrorLike = (error: unknown): error is AuthErrorLike => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAPIError" in error &&
    Boolean((error as AuthErrorLike).isAPIError)
  );
};

export const mockSignInEmail = vi.fn();
export const mockSignUpEmail = vi.fn();

await vi.mock("../../auth", () => {
  return {
    auth: {
      api: { signInEmail: mockSignInEmail, signUpEmail: mockSignUpEmail },
    },
    isAPIError: isAuthErrorLike,
  };
});
