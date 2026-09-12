/**
 * Catalog & Taxonomy Domain REST API Client for Customer Storefront.
 * Pure HTTP transport adapter encapsulating products, categories, and brands endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { ProductQueryParams } from "@/types/api";

export const catalogApi = {
  brands: {
    /**
     * Retrieves all active brands.
     */
    list: (query?: { locale?: string }) =>
      query
        ? api.GET("/api/v1/brands", { params: { query } })
        : api.GET("/api/v1/brands"),
  },

  categories: {
    /**
     * Retrieves flat list of all active categories.
     */
    list: (query?: { locale?: string }) =>
      query
        ? api.GET("/api/v1/categories", { params: { query } })
        : api.GET("/api/v1/categories"),

    /**
     * Retrieves hierarchical category tree.
     */
    getTree: (query?: { locale?: string }) =>
      query
        ? api.GET("/api/v1/categories/tree", { params: { query } })
        : api.GET("/api/v1/categories/tree"),
  },

  products: {
    /**
     * Retrieves catalog products with faceted search and filter options.
     *
     * @param query Optional search, pagination, and filter parameters
     */
    list: (query?: ProductQueryParams) =>
      query
        ? api.GET("/api/v1/products", { params: { query } })
        : api.GET("/api/v1/products"),

    /**
     * Retrieves a single product by unique identifier or URL slug.
     *
     * @param id Product UUID or slug
     * @param query Optional locale parameter
     */
    getById: (id: string, query?: { locale?: string }) =>
      query
        ? api.GET("/api/v1/products/{id}", {
            params: { path: { id }, query },
          })
        : api.GET("/api/v1/products/{id}", {
            params: { path: { id } },
          }),

    /**
     * Retrieves aggregated catalog facet metadata.
     *
     * @param query Optional locale parameter
     */
    getMetadata: (query?: { locale?: string }) =>
      query
        ? api.GET("/api/v1/products/metadata", { params: { query } })
        : api.GET("/api/v1/products/metadata"),
  },
};
