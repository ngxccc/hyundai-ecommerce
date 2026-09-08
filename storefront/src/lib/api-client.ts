/**
 * Typed Storefront REST API Client.
 * Automatically injects customer session tokens from Next.js server cookies.
 * Strictly Server-Side Only.
 */

import createClient, { type Middleware } from "openapi-fetch";
import { env } from "@/env";
import type { paths } from "@/types/api-schema";
import type { ApiProblemDetails } from "@/types/api";

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

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }
  const url = env.BACKEND_API_URL || "http://localhost:3000";
  const trimmed = url.trim().replace(/^["'\\]+|["'\\]+$/g, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const PUBLIC_PREFIXES = ["/products", "/categories", "/brands", "/leads"];

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window !== "undefined") {
      throw new ApiClientError(
        "Direct API client cannot be executed in the browser. Use Next.js Server Actions.",
        500,
      );
    }

    // Next.js 16 "use cache" forbids accessing dynamic cookies() inside cached functions.
    // Public catalog and lead routes never require authorization headers.
    const url = new URL(request.url);
    const normalizedPath = url.pathname.replace(/^\/api\/v1/, "");
    const isPublic = PUBLIC_PREFIXES.some((prefix) =>
      normalizedPath.startsWith(prefix),
    );
    if (isPublic) {
      return request;
    }

    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      if (!request.headers.has("Accept-Language")) {
        const locale = cookieStore.get("NEXT_LOCALE")?.value;
        if (locale) {
          request.headers.set("Accept-Language", locale);
        }
      }

      if (!request.headers.has("Authorization")) {
        const token =
          cookieStore.get("customerAccessToken")?.value ??
          cookieStore.get("accessToken")?.value;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      }
    } catch {
      // Cookies not accessible in non-request contexts
    }
    return request;
  },
};

/**
 * Type-safe OpenAPI Fetch Client for Hyundai Storefront.
 * Strictly server-side: handles server cookies & token injection automatically.
 */
export const api = createClient<paths>({ baseUrl: getBaseUrl() });
api.use(authMiddleware);
