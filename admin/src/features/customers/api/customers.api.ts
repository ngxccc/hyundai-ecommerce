/**
 * Customers & Dealer Tiers Domain REST API Client.
 * Pure HTTP transport adapter encapsulating customer, user, and tier endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";

export const customersApi = {
  /**
   * Retrieves all B2B dealer discount tiers and spend thresholds.
   */
  listTiers: () => api.GET("/api/v1/dealer-tiers"),

  /**
   * Retrieves a specific dealer discount tier by unique identifier.
   *
   * @param id Dealer tier UUID
   */
  getTierById: (id: string) =>
    api.GET("/api/v1/dealer-tiers/{id}", {
      params: { path: { id } },
    }),

  /**
   * Retrieves the currently authenticated admin or staff profile.
   */
  getMe: () => api.GET("/api/v1/users/me"),
};
