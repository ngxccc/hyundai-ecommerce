/**
 * Customer Quote RFQ Domain REST API Client.
 * Pure HTTP transport adapter encapsulating public RFQ request endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { ApiCreateQuote } from "@/types/api";

export const quoteApi = {
  /**
   * Submits a customer quote inquiry (RFQ) from storefront.
   *
   * @param body Quote creation request payload
   */
  create: (body: ApiCreateQuote) =>
    api.POST("/api/v1/quotes", {
      body,
    }),
};
