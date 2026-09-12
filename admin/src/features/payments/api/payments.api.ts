/**
 * Payments Domain REST API Client.
 * Pure HTTP transport adapter encapsulating payment transactions and verification endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { AdminVerifyCashPayment } from "@/types/api";

export const paymentsApi = {
  /**
   * Confirms and verifies offline cash payment for an order by finance staff.
   *
   * @param orderId Order UUID
   * @param body Cash verification details
   */
  verifyCash: (orderId: string, body: AdminVerifyCashPayment) =>
    api.POST("/api/v1/payments/{id}/verify-cash", {
      params: { path: { id: orderId } },
      body,
    }),

  /**
   * Retrieves the primary payment transaction associated with an order.
   *
   * @param orderId Order UUID
   */
  getByOrderId: (orderId: string) =>
    api.GET("/api/v1/payments/order/{orderId}", {
      params: { path: { orderId } },
    }),
};
