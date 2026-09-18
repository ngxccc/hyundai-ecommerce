/**
 * Pure TypeScript DTOs and schema type aliases for Hyundai Admin.
 * 100% compile-time types derived strictly from OpenAPI api-schema.d.ts.
 * Single Source of Truth (SSOT): Zero runtime code, zero side-effects.
 */

import type { paths, components } from "@/types/api-schema";

// 1. API INFRASTRUCTURE & GENERIC ENVELOPES

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

// 2. AUTHENTICATION & USER MANAGEMENT

export type AdminLogin = ApiSchemas["LoginDto"];
export type UserRole = ApiSchemas["UserResponseDto"]["role"];

export type AdminUser = ApiSchemas["UserResponseDto"];
export type AdminDealerTier = ApiSchemas["DealerTierResponseDto"];
export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;

// 3. ANALYTICS & BUSINESS INTELLIGENCE

export type AdminDashboardAnalytics =
  ApiSchemas["DashboardAnalyticsResponseDto"];
export type AdminDashboardAnalyticsQuery = NonNullable<
  ApiPaths["/api/v1/analytics/dashboard"]["get"]["parameters"]["query"]
>;
export type DashboardMetrics = AdminDashboardAnalytics["metrics"];
export type MonthlyRevenue = AdminDashboardAnalytics["monthlyRevenue"][number];
export type CategoryDistribution =
  AdminDashboardAnalytics["categoryDistribution"][number];
export type TopSellingProduct = AdminDashboardAnalytics["topProducts"][number];

// 4. CATALOG & INVENTORY DOMAIN

// Products
export type AdminProduct = ApiSchemas["ProductResponseDto"];
export type AdminCreateProduct = ApiSchemas["CreateProductDto"];
export type AdminUpdateProduct = ApiSchemas["UpdateProductDto"];
export type ProductQueryParams = NonNullable<
  ApiPaths["/api/v1/products"]["get"]["parameters"]["query"]
>;
export type ProductPhase = ProductQueryParams["phase"];
export type ProductFuelType = ProductQueryParams["fuelType"];
export type ProductCanopyType = ProductQueryParams["canopyType"];
export type ProductSort = ProductQueryParams["sort"];

// Categories
export type AdminCategory = ApiSchemas["CategoryResponseDto"];
export type AdminCreateCategory = ApiSchemas["CreateCategoryDto"];
export type AdminUpdateCategory = ApiSchemas["UpdateCategoryDto"];

// Brands
export type AdminBrand = ApiSchemas["BrandResponseDto"];
export type AdminCreateBrand = ApiSchemas["CreateBrandDto"];
export type AdminUpdateBrand = ApiSchemas["UpdateBrandDto"];

// Warehouses & Inventory
export type AdminWarehouse = ApiSchemas["WarehouseResponseDto"];
export type AdminCreateWarehouse = ApiSchemas["CreateWarehouseDto"];
export type AdminUpdateWarehouse = ApiSchemas["UpdateWarehouseDto"];
export type AdminWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];
export type AdminUpdateStock = ApiSchemas["UpdateStockDto"];

// 5. ORDERS & FULFILLMENT DOMAIN

export type AdminOrder = ApiSchemas["OrderResponseDto"];
export type AdminCreateB2bOrder = ApiSchemas["CreateB2bOrderDto"];
export type AdminCreateGuestOrder = ApiSchemas["CreateGuestOrderDto"];
export type AdminOrderItem = AdminOrder["items"][number];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];
export type AdminUpdateOrderStatus = ApiSchemas["UpdateOrderStatusDto"];
export type OrderQueryParams = NonNullable<
  ApiPaths["/api/v1/orders"]["get"]["parameters"]["query"]
>;
export type AdminVerifyCashPayment = ApiSchemas["VerifyCashPaymentDto"];

// 6. B2B QUOTES & COMMERCIAL NEGOTIATIONS

export type AdminQuote = ApiSchemas["AdminQuoteResponseDto"];
export type AdminCreateAdminQuote = ApiSchemas["CreateAdminQuoteDto"];
export type AdminQuoteItem = AdminQuote["items"][number];
export type AdminQuoteMessage = NonNullable<AdminQuote["messages"]>[number];
export type QuoteStatus = ApiSchemas["AdminQuoteResponseDto"]["status"];
export type AdminUpdateQuoteStatus = ApiSchemas["UpdateQuoteStatusDto"];
export type AdminUpdateQuoteItemPrice = ApiSchemas["UpdateQuoteItemPriceDto"];
export type AdminSendQuoteMessage = ApiSchemas["SendQuoteMessageDto"];
export type QuoteQueryParams = NonNullable<
  ApiPaths["/api/v1/quotes"]["get"]["parameters"]["query"]
>;
export type CommercialTerms = NonNullable<
  ApiSchemas["CreateAdminQuoteDto"]["commercialTerms"]
>;
export type QuoteCommercialTerms = NonNullable<AdminQuote["commercialTerms"]>;

// 7. SPEC SHEET TYPES

export * from "./product-spec";
