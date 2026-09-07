/**
 * Typed Admin REST API Client.
 * Automatically injects Admin JWT Bearer tokens from Next.js server cookies.
 * Strictly Server-Side Only.
 */

import createClient, { type Middleware } from "openapi-fetch";
import { cookies } from "next/headers";
import { env } from "@/env";
import type { paths } from "@/types/api-schema";
import type { ApiProblemDetails } from "@/types/api";
import { isJwtExpired } from "@/shared/lib/jwt";
import { rotateAdminToken } from "@/shared/lib/token-refresh";
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

export const getBaseUrl = (): string => {
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

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window !== "undefined") {
      throw new ApiClientError(
        "Direct API client cannot be executed in the browser. Use Next.js Server Actions.",
        500,
      );
    }
    try {
      const cookieStore = await cookies();
      if (!request.headers.has("Accept-Language")) {
        const locale = cookieStore.get("NEXT_LOCALE")?.value;
        if (locale) {
          request.headers.set("Accept-Language", locale);
        }
      }

      if (!request.headers.has("Authorization")) {
        let token =
          cookieStore.get("adminAccessToken")?.value ??
          cookieStore.get("accessToken")?.value;
        const refreshToken =
          cookieStore.get("adminRefreshToken")?.value ??
          cookieStore.get("refreshToken")?.value;

        // Auto Token Rotation: If access token is expired or expiring soon and refresh token exists
        if (isJwtExpired(token) && refreshToken) {
          const rotated = await rotateAdminToken(refreshToken);
          if (rotated) {
            token = rotated.accessToken;
            try {
              cookieStore.set("adminAccessToken", rotated.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 604800,
              });
              cookieStore.set("adminRefreshToken", rotated.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 2592000,
              });
            } catch {
              // Cookie store can be read-only in Server Components
            }
          }
        }

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
 * Type-safe OpenAPI Fetch Client for Hyundai E-Commerce Backend.
 * Strictly server-side: handles server cookies & token injection automatically.
 */
export const api = createClient<paths>({ baseUrl: getBaseUrl() });
api.use(authMiddleware);
