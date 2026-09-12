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

export type ApiProblemDetails = ApiSchemas["Rfc9457ErrorResponseDto"];

// Domain Entity Response DTOs
export type AdminProduct = ApiSchemas["ProductResponseDto"];
export type AdminCreateProduct = ApiSchemas["CreateProductDto"];
export type AdminUpdateProduct = ApiSchemas["UpdateProductDto"];
export type AdminCategory = ApiSchemas["CategoryResponseDto"];
export type AdminCreateCategory = ApiSchemas["CreateCategoryDto"];
export type AdminUpdateCategory = ApiSchemas["UpdateCategoryDto"];
export type AdminBrand = ApiSchemas["BrandResponseDto"];
export type AdminCreateBrand = ApiSchemas["CreateBrandDto"];
export type AdminUpdateBrand = ApiSchemas["UpdateBrandDto"];
export type AdminWarehouse = ApiSchemas["WarehouseResponseDto"];
export type AdminCreateWarehouse = ApiSchemas["CreateWarehouseDto"];
export type AdminUpdateWarehouse = ApiSchemas["UpdateWarehouseDto"];
export type AdminWarehouseStock = ApiSchemas["WarehouseStockResponseDto"];
export type AdminUpdateStock = ApiSchemas["UpdateStockDto"];
export type AdminOrder = ApiSchemas["OrderResponseDto"];
export type AdminCreateB2bOrder = ApiSchemas["CreateB2bOrderDto"];
export type AdminCreateGuestOrder = ApiSchemas["CreateGuestOrderDto"];
export type AdminOrderItem = AdminOrder["items"][number];
export type AdminQuote = ApiSchemas["QuoteResponseDto"];
export type AdminQuoteItem = AdminQuote["items"][number];
export type AdminQuoteMessage = NonNullable<AdminQuote["messages"]>[number];
export type AdminUser = ApiSchemas["UserResponseDto"];
export type AdminDealerTier = ApiSchemas["DealerTierResponseDto"];
export type AdminUpdateOrderStatus = ApiSchemas["UpdateOrderStatusDto"];
export type AdminCreateAdminQuote = ApiSchemas["CreateAdminQuoteDto"];
export type AdminUpdateQuoteStatus = ApiSchemas["UpdateQuoteStatusDto"];
export type AdminUpdateQuoteItemPrice = ApiSchemas["UpdateQuoteItemPriceDto"];
export type AdminSendQuoteMessage = ApiSchemas["SendQuoteMessageDto"];
export type AdminLogin = ApiSchemas["LoginDto"];
export type AdminVerifyCashPayment = ApiSchemas["VerifyCashPaymentDto"];
export type CommercialTerms = NonNullable<
  ApiSchemas["CreateAdminQuoteDto"]["commercialTerms"]
>;
export type QuoteCommercialTerms = NonNullable<AdminQuote["commercialTerms"]>;
export type QuoteStatus = ApiSchemas["QuoteResponseDto"]["status"];
export type OrderStatus = ApiSchemas["OrderResponseDto"]["status"];

export type OrderQueryParams = NonNullable<
  ApiPaths["/api/v1/orders"]["get"]["parameters"]["query"]
>;
export type QuoteQueryParams = NonNullable<
  ApiPaths["/api/v1/quotes"]["get"]["parameters"]["query"]
>;
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
