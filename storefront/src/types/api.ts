/**
 * Pure TypeScript DTOs and schema type aliases for Hyundai Storefront.
 * 100% compile-time types with ZERO runtime code or side effects.
 * Safe to import in both Server Components and Client Components.
 */

import type { paths, components } from "@/types/api-schema";

export type ApiPaths = paths;
export type ApiSchemas = components["schemas"];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type ApiProblemDetails = ApiSchemas["Rfc9457ErrorResponseDto"];

// Domain Entity Response DTOs
export type ApiProduct = ApiSchemas["ProductResponseDto"];
export type ApiCategory = ApiSchemas["CategoryResponseDto"];
export type ApiBrand = ApiSchemas["BrandResponseDto"];
export type ApiWarehouse = ApiSchemas["WarehouseResponseDto"];
export type ApiWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];
export type ApiOrder = ApiSchemas["OrderResponseDto"];
export type ApiOrderItem = ApiOrder["items"][number];
export type ApiQuote = ApiSchemas["QuoteResponseDto"];
export type ApiQuoteItem = ApiQuote["items"][number];
export type ApiQuoteMessage = NonNullable<ApiQuote["messages"]>[number];
export type ApiUser = ApiSchemas["UserResponseDto"];
export type ApiDealerTier = ApiSchemas["DealerTierResponseDto"];
export type CommercialTerms = NonNullable<
  ApiSchemas["CreateAdminQuoteDto"]["commercialTerms"]
>;
export type QuoteCommercialTerms = NonNullable<ApiQuote["commercialTerms"]>;

export type QuoteStatus = ApiSchemas["QuoteResponseDto"]["status"];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;

// Query Parameters derived from OpenAPI Contract
export type ProductQueryParams = NonNullable<
  ApiPaths["/api/v1/products"]["get"]["parameters"]["query"]
>;
export type ProductPhase = ProductQueryParams["phase"];
export type ProductFuelType = ProductQueryParams["fuelType"];
export type ProductCanopyType = ProductQueryParams["canopyType"];
export type ProductSort = ProductQueryParams["sort"];

// Spec Sheet Types
export * from "./product-spec";
