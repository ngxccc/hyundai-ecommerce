/**
 * Typed Admin REST API Client.
 * Automatically injects Admin JWT Bearer tokens from Next.js server cookies.
 * Strictly Server-Side Only.
 */

import createClient, { type Middleware } from "openapi-fetch";
import { env } from "@/env";
import type { paths } from "@/types/api-schema";
import type { ApiProblemDetails } from "@/types/api";

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
 * Strictly server-side: handles server cookies & token injection automatically.
 */
export const api = createClient<paths>({ baseUrl: getBaseUrl() });
api.use(authMiddleware);
