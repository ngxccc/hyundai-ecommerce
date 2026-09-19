/**
 * Pure TypeScript DTOs and schema type aliases for Hyundai Storefront.
 * 100% compile-time types derived strictly from OpenAPI api-schema.d.ts.
 * Single Source of Truth (SSOT): Zero runtime code, zero side-effects.
 */

import type { paths, components } from "@/types/api-schema";
import type { ProductSpecSheet } from "@/types/product-spec";
// ============================================================================
// 1. API INFRASTRUCTURE & GENERIC ENVELOPES
// ============================================================================

export type ApiPaths = paths;
export type ApiSchemas = components["schemas"];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

export type PaginationMeta = ApiSchemas["PaginationMetaDto"];

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type ApiProblemDetails = ApiSchemas["Rfc9457ErrorResponseDto"];

// ============================================================================
// 2. AUTHENTICATION & USER MANAGEMENT
// ============================================================================

export type ApiUser = ApiSchemas["UserResponseDto"];
export type ApiDealerTier = ApiSchemas["DealerTierResponseDto"];
export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;

// ============================================================================
// 3. CATALOG & INVENTORY DOMAIN
// ============================================================================

// Products
export type ApiProduct = ApiSchemas["ProductResponseDto"];
export type ProductQueryParams = NonNullable<
  ApiPaths["/api/v1/products"]["get"]["parameters"]["query"]
>;
export type ProductPhase = ProductQueryParams["phase"];
export type ProductFuelType = ProductQueryParams["fuelType"];
export type ProductCanopyType = ProductQueryParams["canopyType"];
export type ProductSort = ProductQueryParams["sort"];
export type StorefrontProduct = Omit<ApiProduct, "specSheet"> & {
  specSheet?: ProductSpecSheet | null;
};

// Categories & Brands
export type ApiCategory = ApiSchemas["CategoryResponseDto"];
export type StorefrontCategory = ApiCategory;
export type ApiBrand = ApiSchemas["BrandResponseDto"];
export type StorefrontBrand = ApiBrand;
// Warehouses & Stock
export type ApiWarehouse = ApiSchemas["WarehouseResponseDto"];
export type ApiWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];

// ============================================================================
// 4. ORDERS & FULFILLMENT DOMAIN
// ============================================================================

export type ApiOrder = ApiSchemas["OrderResponseDto"];
export type ApiOrderItem = ApiOrder["items"][number];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

// ============================================================================
// 5. B2B QUOTES & COMMERCIAL NEGOTIATIONS
// ============================================================================

export type ApiQuote = ApiSchemas["AdminQuoteResponseDto"];
export type ApiCreateQuote = ApiSchemas["CreateQuoteDto"];
export type ApiQuoteItem = ApiQuote["items"][number];
export type ApiQuoteMessage = NonNullable<ApiQuote["messages"]>[number];
export type QuoteStatus = ApiSchemas["AdminQuoteResponseDto"]["status"];
export type CommercialTerms = NonNullable<
  ApiSchemas["CreateAdminQuoteDto"]["commercialTerms"]
>;
export type QuoteCommercialTerms = NonNullable<ApiQuote["commercialTerms"]>;

// ============================================================================
// 6. SYSTEM & COMPANY SETTINGS
// ============================================================================

export type StorefrontCompanySettings =
  ApiSchemas["CompanySettingsResponseDto"];
export type CompanyHotlines = StorefrontCompanySettings["hotlines"];
export type CompanyEmails = StorefrontCompanySettings["emails"];
export type CompanyAddresses = StorefrontCompanySettings["addresses"];
export type CompanyWorkingHours = StorefrontCompanySettings["workingHours"];
export type CompanyLinks = StorefrontCompanySettings["links"];
export type CompanyBank = StorefrontCompanySettings["bank"];

// ============================================================================
// 7. SPEC SHEET TYPES
// ============================================================================
export * from "./product-spec";
