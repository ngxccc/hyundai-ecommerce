/**
 * Checks if a JWT token is expired or about to expire within skewSeconds.
 * Works across both Node/Bun runtime and Edge runtime environments.
 *
 * @param token - JWT string in format header.payload.signature
 * @param skewSeconds - Clock skew tolerance in seconds (default: 60s)
 * @returns true if token is missing, invalid, or expired/expiring soon
 */
export function isJwtExpired(token?: string | null, skewSeconds = 60): boolean {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return true;

    let payloadStr = "";
    if (typeof Buffer !== "undefined") {
      payloadStr = Buffer.from(parts[1], "base64url").toString("utf-8");
    } else {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      payloadStr = atob(base64);
    }

    const payload = JSON.parse(payloadStr) as { exp?: number };
    if (typeof payload.exp !== "number") return true;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - skewSeconds <= nowSeconds;
  } catch {
    return true;
  }
}
