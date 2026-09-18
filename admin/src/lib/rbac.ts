import type { UserRole } from "@/types/api";

/**
 * Single Source of Truth (SSOT) for Admin Portal RBAC Access Control.
 */

// 1. Roles permitted to authenticate and access the Admin Portal
export const ADMIN_PORTAL_ROLES: readonly UserRole[] = [
  "ADMIN",
  "SALES",
  "WAREHOUSE",
  "ACCOUNTANT",
] as const;

// 2. Specialized Functional Role Groups
export const FINANCE_ROLES: readonly UserRole[] = [
  "ADMIN",
  "ACCOUNTANT",
] as const;

export const SALES_OR_FINANCE_ROLES: readonly UserRole[] = [
  "ADMIN",
  "SALES",
  "ACCOUNTANT",
] as const;

export const WAREHOUSE_ROLES: readonly UserRole[] = [
  "ADMIN",
  "WAREHOUSE",
] as const;

export const SALES_ROLES: readonly UserRole[] = ["ADMIN", "SALES"] as const;

// 3. Centralized Permission Helpers
export const isInternalStaff = (
  role?: string | null,
): role is (typeof ADMIN_PORTAL_ROLES)[number] => {
  return (
    typeof role === "string" && ADMIN_PORTAL_ROLES.includes(role as UserRole)
  );
};

export const canManageFinance = (role?: string | null): boolean => {
  return typeof role === "string" && FINANCE_ROLES.includes(role as UserRole);
};

export const canManageWarehouse = (role?: string | null): boolean => {
  return typeof role === "string" && WAREHOUSE_ROLES.includes(role as UserRole);
};

export const canManageSalesOrFinance = (role?: string | null): boolean => {
  return (
    typeof role === "string" &&
    SALES_OR_FINANCE_ROLES.includes(role as UserRole)
  );
};
