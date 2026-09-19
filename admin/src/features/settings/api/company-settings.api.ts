/**
 * Company Settings Domain REST API Client.
 * Pure HTTP transport adapter encapsulating company configuration endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { UpdateAdminCompanySettings } from "@/types/api";

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
