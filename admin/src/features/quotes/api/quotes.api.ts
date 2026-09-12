/**
 * Quotes Domain REST API Client.
 * Pure HTTP transport adapter encapsulating quote negotiation endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type {
  AdminCreateAdminQuote,
  AdminSendQuoteMessage,
  AdminUpdateQuoteItemPrice,
  AdminUpdateQuoteStatus,
  QuoteQueryParams,
} from "@/types/api";

export const quotesApi = {
  /**
   * Retrieves paginated quotes list with optional status filters.
   *
   * @param query Optional search and status filter parameters
   */
  list: (query?: QuoteQueryParams) =>
    api.GET("/api/v1/quotes", {
      params: { query },
    }),

  /**
   * Retrieves a single quote by unique identifier.
   *
   * @param id Quote UUID
   */
  getById: (id: string) =>
    api.GET("/api/v1/quotes/{id}", {
      params: { path: { id } },
    }),

  /**
   * Creates a quote proposal from administrative backoffice.
   *
   * @param body Admin quote creation payload
   */
  createAdmin: (body: AdminCreateAdminQuote) =>
    api.POST("/api/v1/quotes/admin", {
      body,
    }),

  /**
   * Updates negotiation or lifecycle status of a quote.
   *
   * @param id Quote UUID
   * @param body Quote status update payload
   */
  updateStatus: (id: string, body: AdminUpdateQuoteStatus) =>
    api.PATCH("/api/v1/quotes/{id}/status", {
      params: { path: { id } },
      body,
    }),

  /**
   * Updates negotiated item unit price on a quote.
   *
   * @param quoteId Quote UUID
   * @param itemId Quote item UUID
   * @param body Item price adjustment payload
   */
  updateItemPrice: (
    quoteId: string,
    itemId: string,
    body: AdminUpdateQuoteItemPrice,
  ) =>
    api.PUT("/api/v1/quotes/{id}/items/{itemId}/price", {
      params: { path: { id: quoteId, itemId } },
      body,
    }),

  /**
   * Posts a negotiation message to a quote thread.
   *
   * @param quoteId Quote UUID
   * @param body Message text payload
   */
  sendMessage: (quoteId: string, body: AdminSendQuoteMessage) =>
    api.POST("/api/v1/quotes/{id}/messages", {
      params: { path: { id: quoteId } },
      body,
    }),

  /**
   * Converts an approved quote into a binding B2B sales order.
   *
   * @param id Quote UUID
   */
  approveToOrder: (id: string) =>
    api.POST("/api/v1/quotes/{id}/approve-to-order", {
      params: { path: { id } },
    }),

  /**
   * Exports an official quote document as formatted Excel spreadsheet.
   *
   * @param id Quote UUID
   */
  exportExcel: (id: string) =>
    api.GET("/api/v1/quotes/{id}/export-excel", {
      params: { path: { id } },
      parseAs: "arrayBuffer",
    }),
};
