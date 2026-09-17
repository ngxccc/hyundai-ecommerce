export interface RotatedTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Rotates an expired admin access token using a valid refresh token.
 * Calls backend POST /api/v1/auth/refresh directly without recursive client dependencies.
 *
 * @param refreshToken - Single-use refresh token string
 * @returns New token pair or null if rotation failed / revoked
 */
export async function rotateAdminToken(
  refreshToken?: string | null,
): Promise<RotatedTokens | null> {
  const token = refreshToken?.trim();
  if (!token) return null;

  const envUrl = process.env.BACKEND_API_URL?.trim().replace(
    /^["'\\]+|["'\\]+$/g,
    "",
  );
  const rawUrl = envUrl ?? "http://localhost:3000";
  const baseUrl =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl.replace(/\/+$/, "")
      : `https://${rawUrl.replace(/\/+$/, "")}`;

  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: token }),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as {
      success?: boolean;
      data?: {
        accessToken?: string;
        refreshToken?: string;
      };
    };

    if (!payload.data?.accessToken || !payload.data.refreshToken) {
      return null;
    }

    return {
      accessToken: payload.data.accessToken,
      refreshToken: payload.data.refreshToken,
    };
  } catch (error: unknown) {
    const hasCode = (obj: unknown): obj is { code: string } =>
      typeof obj === "object" &&
      obj !== null &&
      "code" in obj &&
      typeof obj.code === "string";

    const hasCause = (obj: unknown): obj is { cause: unknown } =>
      typeof obj === "object" && obj !== null && "cause" in obj;

    const isConnRefused =
      (hasCode(error) && error.code === "ECONNREFUSED") ||
      (hasCause(error) &&
        hasCode(error.cause) &&
        error.cause.code === "ECONNREFUSED");

    if (isConnRefused) {
      console.warn(
        `[rotateAdminToken] Backend at ${baseUrl} is currently unreachable (ECONNREFUSED). Skipping token rotation.`,
      );
    } else {
      console.error("[rotateAdminToken] Failed to rotate token:", error);
    }
    return null;
  }
}
