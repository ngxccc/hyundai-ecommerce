/**
 * Brands Domain REST API Client.
 * Pure HTTP transport adapter encapsulating brand endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { AdminCreateBrand, AdminUpdateBrand } from "@/types/api";

export const brandsApi = {
  /**
   * Retrieves all partner and manufacturer brands.
   */
  list: () => api.GET("/api/v1/brands"),

  /**
   * Retrieves a single brand by unique identifier.
   *
   * @param id Brand UUID
   */
  getById: (id: string) =>
    api.GET("/api/v1/brands/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a new brand entity.
   *
   * @param body Brand creation payload
   */
  create: (body: AdminCreateBrand) =>
    api.POST("/api/v1/brands", {
      body,
    }),

  /**
   * Updates an existing brand entity.
   *
   * @param id Brand UUID
   * @param body Brand update payload
   */
  update: (id: string, body: AdminUpdateBrand) =>
    api.PUT("/api/v1/brands/{id}", {
      params: { path: { id } },
      body,
    }),

  /**
   * Permanently deletes a brand entity.
   *
   * @param id Brand UUID
   */
  delete: (id: string) =>
    api.DELETE("/api/v1/brands/{id}", {
      params: { path: { id } },
    }),
};
