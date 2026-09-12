/**
 * Products Domain REST API Client.
 * Pure HTTP transport adapter encapsulating product catalog endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type {
  AdminCreateProduct,
  AdminUpdateProduct,
  ProductQueryParams,
} from "@/types/api";

export const productsApi = {
  /**
   * Retrieves paginated product catalog with optional faceted filters.
   *
   * @param query Optional search, pagination, and attribute filter parameters
   */
  list: (query?: ProductQueryParams) =>
    api.GET("/api/v1/products", {
      params: { query },
    }),

  /**
   * Retrieves product facet metadata (brands, categories, price ranges, power capacities).
   */
  getMetadata: () => api.GET("/api/v1/products/metadata"),

  /**
   * Retrieves a single product by unique identifier or URL slug.
   *
   * @param id Product UUID or slug
   */
  getById: (id: string) =>
    api.GET("/api/v1/products/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a new product entity.
   *
   * @param body Product creation payload
   */
  create: (body: AdminCreateProduct) =>
    api.POST("/api/v1/products", {
      body,
    }),

  /**
   * Updates an existing product entity.
   *
   * @param id Product UUID
   * @param body Product update payload
   */
  update: (id: string, body: AdminUpdateProduct) =>
    api.PUT("/api/v1/products/{id}", {
      params: { path: { id } },
      body,
    }),

  /**
   * Permanently deletes a product entity.
   *
   * @param id Product UUID
   */
  delete: (id: string) =>
    api.DELETE("/api/v1/products/{id}", {
      params: { path: { id } },
    }),
};
