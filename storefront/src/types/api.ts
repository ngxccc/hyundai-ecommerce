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

export interface ApiProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: {
    name: string;
    reason: string;
  }[];
}

// Domain Entity Response DTOs
export type ApiProduct = ApiSchemas["ProductResponseDto"];
export type ApiCategory = ApiSchemas["CategoryResponseDto"];
export type ApiBrand = ApiSchemas["BrandResponseDto"];
export type ApiWarehouse = ApiSchemas["WarehouseResponseDto"];
export type ApiWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];
export type ApiOrder = ApiSchemas["OrderResponseDto"];
export type ApiOrderItem = ApiSchemas["OrderItemResponseDto"];
export type ApiQuote = ApiSchemas["QuoteResponseDto"];
export type ApiQuoteItem = ApiSchemas["QuoteItemResponseDto"];
export type ApiQuoteMessage = ApiSchemas["QuoteMessageResponseDto"];
export type ApiUser = ApiSchemas["UserResponseDto"];
export type ApiDealerTier = ApiSchemas["DealerTierResponseDto"];
export type CommercialTerms = ApiSchemas["CommercialTermsDto"];
export type QuoteCommercialTerms = ApiSchemas["QuoteCommercialTermsDto"];

export type QuoteStatus = ApiSchemas["QuoteResponseDto"]["status"];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;

// Query Parameters derived from OpenAPI Contract
export type ProductQueryParams = NonNullable<
  ApiPaths["/products"]["get"]["parameters"]["query"]
>;
export type ProductPhase = ProductQueryParams["phase"];
export type ProductFuelType = ProductQueryParams["fuelType"];
export type ProductCanopyType = ProductQueryParams["canopyType"];
export type ProductSort = ProductQueryParams["sort"];
