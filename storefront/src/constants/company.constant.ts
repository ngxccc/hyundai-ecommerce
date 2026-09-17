/**
 * Centralized company and operational contact configurations.
 * Prevents hardcoding business identity and contact details inside translation strings.
 */
export const COMPANY_CONFIG = {
  BRAND_NAME: "Hyundai Nhật Năng",
  LEGAL_NAME: "Hyundai Nhật Năng Co., Ltd.",
  DEFAULT_ADMIN_EMAIL: "admin@hyundai-nhatnang.vn",
  SUPPORT_EMAIL: "it-support@hyundai-nhatnang.vn",
  HOTLINES: {
    HCM: "0901.49.7771",
    HN: "0979.778.779",
  },
  CONSOLE_VERSION: "v1.4.2",
} as const;
