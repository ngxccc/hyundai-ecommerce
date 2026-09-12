/**
 * Warehouses & Inventory Domain REST API Client.
 * Pure HTTP transport adapter encapsulating warehouse and stock endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type {
  AdminCreateWarehouse,
  AdminUpdateStock,
  AdminUpdateWarehouse,
} from "@/types/api";

export const warehousesApi = {
  /**
   * Retrieves all registered warehouse facilities.
   */
  list: () => api.GET("/api/v1/warehouses"),

  /**
   * Retrieves stock levels across warehouses for a specific product.
   *
   * @param productId Product UUID
   */
  getStockByProduct: (productId: string) =>
    api.GET("/api/v1/warehouses/stock/product/{productId}", {
      params: { path: { productId } },
    }),

  /**
   * Retrieves stock levels for all products within a specific warehouse.
   *
   * @param warehouseId Warehouse UUID
   */
  getStockByWarehouse: (warehouseId: string) =>
    api.GET("/api/v1/warehouses/{id}/stock", {
      params: { path: { id: warehouseId } },
    }),

  /**
   * Retrieves a single warehouse by unique identifier.
   *
   * @param id Warehouse UUID
   */
  getById: (id: string) =>
    api.GET("/api/v1/warehouses/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a new warehouse facility.
   *
   * @param body Warehouse creation payload
   */
  create: (body: AdminCreateWarehouse) =>
    api.POST("/api/v1/warehouses", {
      body,
    }),

  /**
   * Updates warehouse facility details.
   *
   * @param id Warehouse UUID
   * @param body Warehouse update payload
   */
  update: (id: string, body: AdminUpdateWarehouse) =>
    api.PUT("/api/v1/warehouses/{id}", {
      params: { path: { id } },
      body,
    }),

  /**
   * Permanently deletes a warehouse facility.
   *
   * @param id Warehouse UUID
   */
  delete: (id: string) =>
    api.DELETE("/api/v1/warehouses/{id}", {
      params: { path: { id } },
    }),

  /**
   * Adjusts stock inventory level for a product in a warehouse.
   *
   * @param warehouseId Warehouse UUID
   * @param body Stock update transaction payload
   */
  updateStock: (warehouseId: string, body: AdminUpdateStock) =>
    api.PUT("/api/v1/warehouses/{id}/stock", {
      params: { path: { id: warehouseId } },
      body,
    }),
};
