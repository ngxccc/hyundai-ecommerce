/**
 * Typed REST API client for communicating with the Hyundai E-Commerce NestJS Backend.
 * Replaces direct in-process database queries with HTTP fetch and Next.js ISR/cache tags.
 */

import createClient from "openapi-fetch";
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

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly problem?: ApiProblemDetails | undefined;

  constructor(message: string, status: number, problem?: ApiProblemDetails) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.problem = problem;
  }
}

// Data Transfer Types matching Backend OpenAPI Schema
export interface ApiProduct {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  price: string;
  shortDescriptionVi: string | null;
  shortDescriptionEn: string | null;
  descriptionVi: unknown;
  descriptionEn: unknown;
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  specs: Record<string, unknown> | null;
  totalStockCache: number;
  isQuoteOnly: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ApiCategoryTree extends ApiCategory {
  children: ApiCategoryTree[];
}

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  website: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ApiProductMetadata {
  brands: { id: string; name: string }[];
  categories: { id: string; nameVi: string; nameEn: string | null }[];
  filters: {
    id: string;
    nameVi: string;
    nameEn: string | null;
    categoryId: string | null;
    brandId: string | null;
    specs: Record<string, unknown> | null;
  }[];
}

export interface ApiCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: ApiProduct;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCart {
  id: string;
  userId: string;
  status: string;
  items: ApiCartItem[];
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  shippingAddress: string;
  totalAmount: string;
  depositAmount: string;
  remainingAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  note: string | null;
  items?: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product?: ApiProduct;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCheckoutLink {
  checkoutUrl: string;
  qrCode: string;
  orderCode: number;
  amount: number;
  paymentLinkId: string;
}

export interface ApiQuote {
  id: string;
  quoteNumber: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  companyName: string | null;
  taxId: string | null;
  shippingAddress: string | null;
  totalAmount: string;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  creditLimit: string;
  currentDebt: string;
  companyName: string | null;
  taxId: string | null;
}

export interface ApiLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface RequestOptions extends RequestInit {
  token?: string;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  const url =
    (env as Record<string, string | undefined>).BACKEND_API_URL ??
    "http://localhost:3000";
  const trimmed = url.trim().replace(/^["'\\]+|["'\\]+$/g, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

/**
 * Type-safe OpenAPI Fetch Client for Storefront.
 * Generates full autocomplete for URLs, parameters, and response schemas.
 */
export const api = createClient<paths>({ baseUrl: getBaseUrl() });

/**
 * Low-level HTTP fetch wrapper handling authorization headers, response parsing, and error normalization.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  if (typeof window !== "undefined") {
    throw new ApiClientError(
      "apiFetch cannot be called on the client. Use Server Actions instead.",
      500,
    );
  }
  const baseUrl = getBaseUrl();
  const base = new URL(baseUrl);
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = new URL(cleanPath, base);

  if (targetUrl.origin !== base.origin) {
    throw new ApiClientError("Cross-origin requests are forbidden", 403);
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
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
        // Response wasn't valid JSON
      }
    }

    const message =
      errorDetails?.detail ??
      errorDetails?.title ??
      `API request failed with HTTP ${response.status}: ${response.statusText}`;

    throw new ApiClientError(message, response.status, errorDetails);
  }

  if (!isJson) {
    return (await response.text()) as unknown as T;
  }

  const body = (await response.json()) as ApiResponse<T> | T;
  // If wrapped in our standard ApiResponse envelope, unwrap data
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

/**
 * Domain-scoped API client methods.
 */
export const apiClient = {
  // Catalog domain
  catalog: {
    getProducts: (
      params: Record<string, string | number | undefined> = {},
      options?: RequestOptions,
    ): Promise<PaginatedResponse<ApiProduct>> => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const query = searchParams.toString();
      const endpoint = query ? `/products?${query}` : "/products";
      return apiFetch<PaginatedResponse<ApiProduct>>(endpoint, {
        next: { tags: ["products"], revalidate: 3600 },
        ...options,
      });
    },

    getProductByIdOrSlug: async (
      identifier: string,
      options?: RequestOptions,
    ): Promise<ApiProduct | null> => {
      try {
        return await apiFetch<ApiProduct>(`/products/${identifier}`, {
          next: {
            tags: ["products", `product-${identifier}`],
            revalidate: 3600,
          },
          ...options,
        });
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },

    getFiltersMetadata: (
      options?: RequestOptions,
    ): Promise<ApiProductMetadata> => {
      return apiFetch<ApiProductMetadata>("/products/metadata", {
        next: { tags: ["product-metadata"], revalidate: 86400 },
        ...options,
      });
    },

    getCategories: (options?: RequestOptions): Promise<ApiCategory[]> => {
      return apiFetch<ApiCategory[]>("/categories", {
        next: { tags: ["categories"], revalidate: 86400 },
        ...options,
      });
    },

    getCategoryTree: (options?: RequestOptions): Promise<ApiCategoryTree[]> => {
      return apiFetch<ApiCategoryTree[]>("/categories/tree", {
        next: { tags: ["category-tree"], revalidate: 86400 },
        ...options,
      });
    },

    getBrands: (options?: RequestOptions): Promise<ApiBrand[]> => {
      return apiFetch<ApiBrand[]>("/brands", {
        next: { tags: ["brands"], revalidate: 86400 },
        ...options,
      });
    },
  },

  // Cart domain
  cart: {
    getCart: (token: string): Promise<ApiCart> => {
      return apiFetch<ApiCart>("/cart", {
        token,
        cache: "no-store",
      });
    },

    addItem: (
      token: string,
      productId: string,
      quantity = 1,
    ): Promise<ApiCart> => {
      return apiFetch<ApiCart>("/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({ productId, quantity }),
      });
    },

    updateItem: (
      token: string,
      itemId: string,
      quantity: number,
    ): Promise<ApiCart> => {
      return apiFetch<ApiCart>(`/cart/items/${itemId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ quantity }),
      });
    },

    removeItem: (token: string, itemId: string): Promise<ApiCart> => {
      return apiFetch<ApiCart>(`/cart/items/${itemId}`, {
        method: "DELETE",
        token,
      });
    },

    mergeCart: (
      token: string,
      items: { productId: string; quantity: number }[],
    ): Promise<ApiCart> => {
      return apiFetch<ApiCart>("/cart/merge", {
        method: "POST",
        token,
        body: JSON.stringify({ items }),
      });
    },
  },

  // Orders domain
  orders: {
    checkoutB2B: (
      token: string,
      data: {
        shippingAddress: string;
        paymentMethod: string;
        paymentOption?: "FULL_PAYMENT" | "DEPOSIT";
        note?: string;
      },
    ): Promise<ApiOrder> => {
      return apiFetch<ApiOrder>("/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      });
    },

    checkoutGuest: (data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      shippingAddress: string;
      paymentMethod?: string;
      note?: string | null;
      items: { productId: string; quantity: number }[];
    }): Promise<ApiOrder> => {
      return apiFetch<ApiOrder>("/orders/guest", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    getOrderById: (token: string, id: string): Promise<ApiOrder> => {
      return apiFetch<ApiOrder>(`/orders/${id}`, {
        token,
        cache: "no-store",
      });
    },

    listOrders: (
      token: string,
      params?: { page?: number; limit?: number },
    ): Promise<PaginatedResponse<ApiOrder>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return apiFetch<PaginatedResponse<ApiOrder>>(
        query ? `/orders?${query}` : "/orders",
        {
          token,
          cache: "no-store",
        },
      );
    },
  },

  // Payments domain
  payments: {
    createCheckoutLink: (data: {
      orderId: string;
      transactionType?: "FULL_PAYMENT" | "DEPOSIT" | "REMAINING";
    }): Promise<ApiCheckoutLink> => {
      return apiFetch<ApiCheckoutLink>("/payments/checkout-link", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    getOrderPaymentSummary: (
      token: string,
      orderId: string,
    ): Promise<{
      orderId: string;
      paymentStatus: string;
      transactions: {
        id: string;
        amount: string;
        paymentMethod: string;
        status: string;
        orderCode: number | null;
      }[];
    }> => {
      return apiFetch(`/payments/order/${orderId}`, {
        token,
        cache: "no-store",
      });
    },

    repayDebt: (
      token: string,
      data: {
        userId: string;
        amount: number;
        paymentMethod: "PAYOS" | "CASH";
        note?: string;
      },
    ): Promise<{
      id: string;
      userId: string;
      amount: string;
      paymentMethod: string;
      status: string;
      checkoutUrl?: string;
      qrCode?: string;
    }> => {
      return apiFetch("/payments/repay-debt", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      });
    },
  },

  // Quotes domain
  quotes: {
    createQuote: (data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      companyName?: string | null;
      taxId?: string | null;
      shippingAddress?: string | null;
      note?: string | null;
      items: {
        productId?: string | null;
        isCustomItem?: boolean;
        itemName: string;
        itemModel?: string | null;
        itemSpecs?: string | null;
        quantity: number;
        requestedPrice?: string | null;
      }[];
    }): Promise<ApiQuote> => {
      return apiFetch<ApiQuote>("/quotes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    listQuotes: (
      token: string,
      params?: { page?: number; limit?: number },
    ): Promise<PaginatedResponse<ApiQuote>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      return apiFetch<PaginatedResponse<ApiQuote>>(
        query ? `/quotes?${query}` : "/quotes",
        {
          token,
          cache: "no-store",
        },
      );
    },

    getQuoteById: (token: string, id: string): Promise<ApiQuote> => {
      return apiFetch<ApiQuote>(`/quotes/${id}`, {
        token,
        cache: "no-store",
      });
    },
  },

  // Leads CRM domain
  leads: {
    createLead: (data: {
      customerName: string;
      phoneNumber: string;
      email?: string | null;
      companyName?: string | null;
      notes?: string | null;
      items?: {
        productId?: string;
        productName: string;
        quantity: number;
      }[];
    }): Promise<{ id: string; customerName: string; status: string }> => {
      return apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  // Auth & Profile domain
  auth: {
    login: (data: {
      email: string;
      password: string;
    }): Promise<ApiLoginResponse> => {
      return apiFetch<ApiLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    register: (data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber: string;
    }): Promise<{ id: string; email: string; fullName: string }> => {
      return apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    getMe: (token: string): Promise<ApiUser> => {
      return apiFetch<ApiUser>("/users/me", {
        token,
        cache: "no-store",
      });
    },
  },
};
