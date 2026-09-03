export const USER_ROLES = [
  "SUPER_ADMIN",
  "SALES_REPRESENTATIVE",
  "ACCOUNTANT",
  "WAREHOUSE_MANAGER",
  "DEALER_APPROVER",
  "DEALER_PURCHASER",
  "CUSTOMER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const BUSINESS_TYPES = [
  "DEALER",
  "CONTRACTOR",
  "END_USER",
  "DISTRIBUTOR",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
