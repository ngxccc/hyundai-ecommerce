/**
 * Company Settings Domain REST API Client.
 * Pure HTTP transport adapter encapsulating company configuration endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type {
  AdminCompanySettings,
  UpdateAdminCompanySettings,
} from "@/types/api";

export const EMPTY_COMPANY_SETTINGS: AdminCompanySettings = {
  id: "019de1a0-0000-7000-8000-000000000099",
  legalNameVi: "",
  legalNameEn: "",
  shortName: "",
  brandName: "",
  brandTitle: "",
  brandFullName: "",
  taxId: "",
  hotlines: {
    project: {
      raw: "",
      display: "",
      formatted: "",
      labelVi: "Dự án & Báo giá B2B",
      labelEn: "B2B Projects & Quotation",
    },
    technical: {
      raw: "",
      display: "",
      formatted: "",
      labelVi: "Hỗ trợ Kỹ thuật 24/7",
      labelEn: "24/7 Technical Support",
    },
  },
  emails: { sales: "", project: "", support: "", general: "" },
  addresses: {
    headquarters: { vi: "", en: "" },
    warehouse: { vi: "", en: "" },
  },
  workingHours: { vi: "", en: "" },
  links: { website: "", zalo: "", facebook: "" },
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
   * Retrieves active company settings.
   */
  get: () =>
    api.GET("/api/v1/settings/company", {
      next: { tags: ["company-settings"] },
    }),

  /**
   * Updates company settings with administrator authorization.
   *
   * @param body Company settings update payload
   */
  update: (body: UpdateAdminCompanySettings) =>
    api.PUT("/api/v1/settings/company", {
      body,
    }),
};
