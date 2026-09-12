/**
 * Orders Domain REST API Client.
 * Pure HTTP transport adapter encapsulating order management endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type {
  AdminCreateB2bOrder,
  AdminUpdateOrderStatus,
  OrderQueryParams,
} from "@/types/api";

export const ordersApi = {
  /**
   * Retrieves paginated orders list with optional status/date filters.
   *
   * @param query Optional search, status, and date range parameters
   */
  list: (query?: OrderQueryParams) =>
    api.GET("/api/v1/orders", {
      params: { query },
    }),

  /**
   * Retrieves a single order by unique identifier.
   *
   * @param id Order UUID
   */
  getById: (id: string) =>
    api.GET("/api/v1/orders/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a B2B order from administrative backoffice.
   *
   * @param body B2B order creation payload
   */
  createAdmin: (body: AdminCreateB2bOrder) =>
    api.POST("/api/v1/orders/admin", {
      body,
    }),

  /**
   * Updates state transition status for an existing order.
   *
   * @param id Order UUID
   * @param body Order status update payload
   */
  updateStatus: (id: string, body: AdminUpdateOrderStatus) =>
    api.PATCH("/api/v1/orders/{id}/status", {
      params: { path: { id } },
      body,
    }),

  /**
   * Cancels an order and initiates automated stock recovery.
   *
   * @param id Order UUID
   */
  cancel: (id: string) =>
    api.POST("/api/v1/orders/{id}/cancel", {
      params: { path: { id } },
    }),
};
