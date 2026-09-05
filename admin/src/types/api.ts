/**
 * Pure TypeScript DTOs and schema type aliases for Hyundai Admin.
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
export type AdminProduct = ApiSchemas["ProductResponseDto"];
export type AdminCategory = ApiSchemas["CategoryResponseDto"];
export type AdminBrand = ApiSchemas["BrandResponseDto"];
export type AdminWarehouse = ApiSchemas["WarehouseResponseDto"];
export type AdminWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];
export type AdminOrder = ApiSchemas["OrderResponseDto"];
export type AdminOrderItem = ApiSchemas["OrderItemResponseDto"];
export type AdminQuote = ApiSchemas["QuoteResponseDto"];
export type AdminQuoteItem = ApiSchemas["QuoteItemResponseDto"];
export type AdminQuoteMessage = ApiSchemas["QuoteMessageResponseDto"];
export type AdminUser = ApiSchemas["UserResponseDto"];
export type AdminDealerTier = ApiSchemas["DealerTierResponseDto"];
export type CommercialTerms = ApiSchemas["CommercialTermsDto"];
export type QuoteCommercialTerms = ApiSchemas["QuoteCommercialTermsDto"];

export type QuoteStatus = ApiSchemas["QuoteResponseDto"]["status"];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;
