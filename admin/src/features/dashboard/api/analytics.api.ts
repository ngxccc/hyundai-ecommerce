/**
 * Analytics Domain REST API Client.
 * Pure HTTP transport adapter encapsulating analytics endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { AdminDashboardAnalyticsQuery } from "@/types/api";

export const analyticsApi = {
  /**
   * Retrieves consolidated dashboard analytics for a target year.
   * Cached for 60 seconds via Next.js Data Cache to optimize SSR load times.
   *
   * @param query - Optional query with target year.
   */
  getDashboard: (query?: AdminDashboardAnalyticsQuery) =>
    api.GET("/api/v1/analytics/dashboard", {
      params: { query },
      next: { revalidate: 60, tags: ["analytics"] },
    }),
};
