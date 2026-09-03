import { getCachedSession } from "./session";
import { AuthError, type UserRole } from "@nhatnang/core";

export const getAuthErrorMessage = (
  error: AuthError,
  t: (key: "unauthorized" | "forbidden") => string,
): string => {
  return error.code === "UNAUTHORIZED" || error.message === "UNAUTHORIZED"
    ? t("unauthorized")
    : t("forbidden");
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

  if (!allowedRoles.includes(session.user.role)) {
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
