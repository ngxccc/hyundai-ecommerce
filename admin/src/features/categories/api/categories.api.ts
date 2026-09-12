/**
 * Categories Domain REST API Client.
 * Pure HTTP transport adapter encapsulating category endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { AdminCreateCategory, AdminUpdateCategory } from "@/types/api";

export const categoriesApi = {
  /**
   * Retrieves all flat category taxonomy items.
   */
  list: () => api.GET("/api/v1/categories"),

  /**
   * Retrieves hierarchical category tree structure.
   */
  getTree: () => api.GET("/api/v1/categories/tree"),

  /**
   * Retrieves a single category by unique identifier.
   *
   * @param id Category UUID
   */
  getById: (id: string) =>
    api.GET("/api/v1/categories/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a new category entity.
   *
   * @param body Category creation payload
   */
  create: (body: AdminCreateCategory) =>
    api.POST("/api/v1/categories", {
      body,
    }),

  /**
   * Updates an existing category entity.
   *
   * @param id Category UUID
   * @param body Category update payload
   */
  update: (id: string, body: AdminUpdateCategory) =>
    api.PUT("/api/v1/categories/{id}", {
      params: { path: { id } },
      body,
    }),

  /**
   * Permanently deletes a category entity.
   *
   * @param id Category UUID
   */
  delete: (id: string) =>
    api.DELETE("/api/v1/categories/{id}", {
      params: { path: { id } },
    }),
};
