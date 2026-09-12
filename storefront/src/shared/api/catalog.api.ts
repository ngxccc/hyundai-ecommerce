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
    list: () => api.GET("/api/v1/brands"),
  },

  categories: {
    /**
     * Retrieves flat list of all active categories.
     */
    list: () => api.GET("/api/v1/categories"),

    /**
     * Retrieves hierarchical category tree.
     */
    getTree: () => api.GET("/api/v1/categories/tree"),
  },

  products: {
    /**
     * Retrieves catalog products with faceted search and filter options.
     *
     * @param query Optional search, pagination, and filter parameters
     */
    list: (query?: ProductQueryParams) =>
      api.GET("/api/v1/products", {
        params: { query },
      }),

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
     * Retrieves aggregated catalog facet metadata.
     */
    getMetadata: () => api.GET("/api/v1/products/metadata"),
  },
};
