/**
 * Typed Admin REST API Client.
 * Automatically injects Admin JWT Bearer tokens from Next.js server cookies.
 */

import createClient, { type Middleware } from "openapi-fetch";
import { env } from "@/env";
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
export {
  QUOTE_STATUS,
  ORDER_STATUS,
  orderStatusEnum,
  quoteStatusEnum,
  type QuoteStatus,
  type OrderStatus,
} from "@/shared/constants";

export type BusinessType = NonNullable<
  NonNullable<ApiSchemas["UserResponseDto"]["dealerCompany"]>["businessType"]
>;

export interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly problem?: ApiProblemDetails;

  constructor(message: string, status: number, problem?: ApiProblemDetails) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.problem = problem;
  }
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  const url = env.BACKEND_API_URL;
  const trimmed = url.trim().replace(/^["'\\]+|["'\\]+$/g, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window !== "undefined") {
      throw new ApiClientError(
        "Direct API client cannot be executed in the browser. Use Next.js Server Actions.",
        500,
      );
    }
    if (!request.headers.has("Authorization")) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token =
          cookieStore.get("adminAccessToken")?.value ??
          cookieStore.get("accessToken")?.value;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      } catch {
        // Cookies not accessible in non-request contexts
      }
    }
    return request;
  },
};

/**
 * Type-safe OpenAPI Fetch Client for Hyundai E-Commerce Backend.
 * Generates full autocomplete for URLs, parameters, and response schemas.
 */
export const api = createClient<paths>({ baseUrl: getBaseUrl() });
api.use(authMiddleware);

export function safeId(id: string): string {
  const trimmed = id.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new ApiClientError("Invalid identifier format", 400);
  }
  return encodeURIComponent(trimmed);
}

export async function adminApiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  if (typeof window !== "undefined") {
    throw new ApiClientError(
      "adminApiFetch cannot be called on the client. Use Server Actions instead.",
      500,
    );
  }

  if (
    endpoint.includes("://") ||
    endpoint.startsWith("//") ||
    endpoint.includes("..") ||
    endpoint.includes("\\")
  ) {
    throw new ApiClientError("Forbidden URL pattern", 400);
  }

  const baseUrl = getBaseUrl();
  const base = new URL(baseUrl);
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = new URL(cleanPath, base.origin);

  if (
    targetUrl.origin !== base.origin ||
    !targetUrl.href.startsWith(base.origin + "/")
  ) {
    throw new ApiClientError("Cross-origin requests are forbidden", 403);
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (
    !options.skipAuth &&
    !headers.Authorization &&
    typeof window === "undefined"
  ) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token =
        options.token ??
        cookieStore.get("adminAccessToken")?.value ??
        cookieStore.get("accessToken")?.value;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Out of request context
    }
  }

  const response = await fetch(targetUrl.toString(), {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("json");

  if (!response.ok) {
    let errorDetails: ApiProblemDetails | undefined;
    if (isJson) {
      try {
        errorDetails = (await response.json()) as ApiProblemDetails;
      } catch {
        // Not valid JSON
      }
    }

    const message =
      errorDetails?.detail ??
      errorDetails?.title ??
      `Backend API request failed with HTTP ${response.status}: ${response.statusText}`;

    throw new ApiClientError(message, response.status, errorDetails);
  }

  if (!isJson) {
    return (await response.text()) as unknown as T;
  }

  const body = (await response.json()) as ApiResponse<T> | T;
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    if ("meta" in body && body.meta && typeof body.meta === "object") {
      return {
        items: body.data,
        pagination: body.meta,
      } as unknown as T;
    }
    return body.data;
  }
  return body;
}

export const adminApiClient = {
  auth: {
    login: (dto: { email: string; password: string }) =>
      adminApiFetch<{
        accessToken: string;
        refreshToken: string;
        user: AdminUser;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(dto),
        skipAuth: true,
      }),

    getMe: () => adminApiFetch<AdminUser>("/users/me"),
  },

  products: {
    list: async (
      params: Record<string, string | number | boolean | undefined> = {},
    ) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const query = searchParams.toString();
      const res = await adminApiFetch<
        | {
            items: AdminProduct[];
            pagination: PaginationMeta;
          }
        | AdminProduct[]
      >(query ? `/products?${query}` : "/products");

      if (Array.isArray(res)) {
        return {
          items: res,
          pagination: {
            total: res.length,
            page: 1,
            limit: res.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
      return res;
    },

    getById: (id: string) =>
      adminApiFetch<AdminProduct | null>(`/products/${safeId(id)}`),

    create: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminProduct>("/products", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    update: (id: string, dto: Record<string, unknown>) =>
      adminApiFetch<AdminProduct>(`/products/${safeId(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),

    delete: (id: string) =>
      adminApiFetch<boolean>(`/products/${safeId(id)}`, {
        method: "DELETE",
      }),
  },

  categories: {
    list: () => adminApiFetch<AdminCategory[]>("/categories"),

    tree: () => adminApiFetch<AdminCategory[]>("/categories/tree"),

    getById: (id: string) =>
      adminApiFetch<AdminCategory | null>(`/categories/${safeId(id)}`),

    create: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminCategory>("/categories", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    update: (id: string, dto: Record<string, unknown>) =>
      adminApiFetch<AdminCategory>(`/categories/${safeId(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),

    delete: (id: string) =>
      adminApiFetch<boolean>(`/categories/${safeId(id)}`, {
        method: "DELETE",
      }),
  },

  brands: {
    list: () => adminApiFetch<AdminBrand[]>("/brands"),

    getById: (id: string) =>
      adminApiFetch<AdminBrand | null>(`/brands/${safeId(id)}`),

    create: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminBrand>("/brands", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    update: (id: string, dto: Record<string, unknown>) =>
      adminApiFetch<AdminBrand>(`/brands/${safeId(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),

    delete: (id: string) =>
      adminApiFetch<boolean>(`/brands/${safeId(id)}`, {
        method: "DELETE",
      }),
  },

  quotes: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const query = searchParams.toString();
      return adminApiFetch<PaginatedResponse<AdminQuote>>(
        query ? `/quotes?${query}` : "/quotes",
      );
    },

    getById: (id: string) =>
      adminApiFetch<AdminQuote | null>(`/quotes/${safeId(id)}`),

    createAdminQuote: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminQuote>("/quotes/admin", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    updateStatus: (id: string, status: string) =>
      adminApiFetch<AdminQuote>(`/quotes/${safeId(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    updateItemPrice: (id: string, itemId: string, agreedPrice: string) =>
      adminApiFetch<AdminQuote>(
        `/quotes/${safeId(id)}/items/${safeId(itemId)}/price`,
        {
          method: "PUT",
          body: JSON.stringify({ agreedPrice }),
        },
      ),

    sendMessage: (id: string, message: string) =>
      adminApiFetch<{ id: string; message: string }>(
        `/quotes/${safeId(id)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message }),
        },
      ),

    approveToOrder: (id: string) =>
      adminApiFetch<{ orderId: string; quoteId: string }>(
        `/quotes/${safeId(id)}/approve-to-order`,
        {
          method: "POST",
        },
      ),

    exportExcel: (id: string) => {
      const baseUrl = getBaseUrl();
      const base = new URL(baseUrl);
      const targetUrl = new URL(
        `/quotes/${safeId(id)}/export-excel`,
        base.origin,
      );
      if (targetUrl.origin !== base.origin) {
        throw new ApiClientError("Cross-origin requests are forbidden", 403);
      }
      return fetch(targetUrl.href);
    },
  },

  orders: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const query = searchParams.toString();
      return adminApiFetch<PaginatedResponse<AdminOrder>>(
        query ? `/orders?${query}` : "/orders",
      );
    },

    getById: (id: string) =>
      adminApiFetch<AdminOrder | null>(`/orders/${safeId(id)}`),

    createB2B: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminOrder>("/orders/admin", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    updateStatus: (id: string, status: string, note?: string) =>
      adminApiFetch<AdminOrder>(`/orders/${safeId(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),

    cancel: (id: string) =>
      adminApiFetch<AdminOrder>(`/orders/${safeId(id)}/cancel`, {
        method: "POST",
      }),
  },

  payments: {
    verifyCash: (id: string, dto: { amount: number; note?: string }) =>
      adminApiFetch<{ orderId: string; paymentStatus: string }>(
        `/payments/${safeId(id)}/verify-cash`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
      ),

    getOrderSummary: (orderId: string) =>
      adminApiFetch<{ orderId: string; paymentStatus: string }>(
        `/payments/order/${safeId(orderId)}`,
      ),
  },

  warehouses: {
    list: () => adminApiFetch<AdminWarehouse[]>("/warehouses"),

    getById: (id: string) =>
      adminApiFetch<AdminWarehouse | null>(`/warehouses/${safeId(id)}`),

    create: (dto: Record<string, unknown>) =>
      adminApiFetch<AdminWarehouse>("/warehouses", {
        method: "POST",
        body: JSON.stringify(dto),
      }),

    update: (id: string, dto: Record<string, unknown>) =>
      adminApiFetch<AdminWarehouse>(`/warehouses/${safeId(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),

    delete: (id: string) =>
      adminApiFetch<boolean>(`/warehouses/${safeId(id)}`, {
        method: "DELETE",
      }),

    updateStock: (
      id: string,
      dto: { productId: string; stock: number; minStockWarning?: number },
    ) =>
      adminApiFetch<AdminWarehouseStock>(`/warehouses/${safeId(id)}/stock`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),

    getProductStock: (productId: string) =>
      adminApiFetch<AdminWarehouseStock[]>(
        `/warehouses/stock/product/${safeId(productId)}`,
      ),
  },

  dealerTiers: {
    list: () => adminApiFetch<AdminDealerTier[]>("/dealer-tiers"),

    getById: (id: string) =>
      adminApiFetch<AdminDealerTier>(`/dealer-tiers/${safeId(id)}`),
  },
};
