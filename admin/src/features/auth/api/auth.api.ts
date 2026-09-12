/**
 * Authentication Domain REST API Client.
 * Pure HTTP transport adapter encapsulating login and token management endpoints with 100% type inference.
 */

import { api } from "@/lib/api-client";
import type { AdminLogin } from "@/types/api";

export const authApi = {
  /**
   * Submits user credentials to obtain JWT access and refresh tokens.
   *
   * @param body Login credentials payload
   */
  login: (body: AdminLogin) =>
    api.POST("/api/v1/auth/login", {
      body,
    }),

  /**
   * Exchanges an active refresh token for a fresh access token.
   *
   * @param body Refresh token payload
   */
  refresh: (body: { refreshToken: string }) =>
    api.POST("/api/v1/auth/refresh", {
      body,
    }),
};
