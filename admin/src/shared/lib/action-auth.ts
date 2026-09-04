import { getCachedSession } from "./session";

export type UserRole =
  | "SUPER_ADMIN"
  | "SALES_REPRESENTATIVE"
  | "ACCOUNTANT"
  | "WAREHOUSE_MANAGER"
  | "DEALER"
  | "CUSTOMER";

export type JSONContent = Record<string, unknown>;
export class AuthError extends Error {
  public code: string;
  constructor(code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

export function isDomainError(
  error: unknown,
): error is { translationKey: string } {
  return (
    typeof error === "object" && error !== null && "translationKey" in error
  );
}

export const getAuthErrorMessage = (
  error: AuthError,
  t: (key: "unauthorized" | "forbidden") => string,
): string => {
  return error.code === "UNAUTHORIZED" || error.message === "UNAUTHORIZED"
    ? t("unauthorized")
    : t("forbidden");
};

export const getActionErrorMessage = (
  error: unknown,
  t: (key: string) => string,
  fallbackKey = "default",
): string => {
  if (error instanceof AuthError) {
    return getAuthErrorMessage(error, t);
  }
  if (isDomainError(error)) {
    return t(error.translationKey);
  }
  if (error instanceof Error && error.message.startsWith("errors.")) {
    const key = error.message.replace("errors.", "");
    return t(key);
  }
  return t(fallbackKey);
};

export const requireAuth = async () => {
  const session = await getCachedSession();

  if (!session?.user) {
    throw new AuthError("UNAUTHORIZED");
  }

  const allowedRoles = [
    "SUPER_ADMIN",
    "SALES_REPRESENTATIVE",
    "ACCOUNTANT",
    "WAREHOUSE_MANAGER",
  ];
  if (!allowedRoles.includes(session.user.role)) {
    throw new AuthError("FORBIDDEN");
  }

  return session;
};

export const assertRole = async (allowedRoles: UserRole[]) => {
  const session = await getCachedSession();

  if (!session?.user) {
    throw new AuthError("UNAUTHORIZED");
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new AuthError("FORBIDDEN");
  }

  return session;
};

export const assertFinanceRole = () =>
  assertRole(["SUPER_ADMIN", "ACCOUNTANT"]);

export const assertSalesOrFinanceRole = () =>
  assertRole(["SUPER_ADMIN", "SALES_REPRESENTATIVE", "ACCOUNTANT"]);

export const assertWarehouseRole = () =>
  assertRole(["SUPER_ADMIN", "WAREHOUSE_MANAGER"]);
