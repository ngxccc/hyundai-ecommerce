import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/lib/api-client";
import type { StorefrontCompanySettings } from "@/types/api";

export const EMPTY_STOREFRONT_COMPANY_SETTINGS: StorefrontCompanySettings = {
  id: "019de1a0-0000-7000-8000-000000000099",
  legalNameVi: "",
  legalNameEn: "",
  shortName: "",
  brandName: "",
  brandTitle: "",
  brandFullName: "",
  taxId: "",
  hotlines: {
    project: { raw: "", display: "" },
    technical: { raw: "", display: "" },
  },
  emails: { sales: "", project: "", support: "", general: "" },
  addresses: {
    headquarters: { vi: "", en: "" },
    warehouse: { vi: "", en: "" },
  },
  workingHours: { vi: "", en: "" },
  links: { website: "" },
  bank: {
    bankName: "",
    branchVi: "",
    branchEn: "",
    accountNo: "",
    accountName: "",
    bin: "",
    qrTemplate: "qr_only",
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const companySettingsApi = {
  /**
   * Retrieves active company settings with tag-based caching.
   */
  get: () =>
    api.GET("/api/v1/settings/company", {
      next: { tags: ["company-settings"], revalidate: 86400 },
    }),
};

/**
 * Server-side helper to fetch company settings directly from backend with safe empty fallback.
 * Integrates with Next.js 16 "use cache" for build-time and runtime pre-rendering.
 *
 * @returns Active company settings from database or empty structure
 */
export async function getCompanySettings(): Promise<StorefrontCompanySettings> {
  "use cache";
  cacheLife("days");
  cacheTag("company-settings");
  try {
    const { data } = await companySettingsApi.get();
    if (data?.data) {
      return data.data;
    }
  } catch (error) {
    console.warn(
      "[Storefront] Unable to fetch active company settings, utilizing empty default structure:",
      error,
    );
  }
  return EMPTY_STOREFRONT_COMPANY_SETTINGS;
}
