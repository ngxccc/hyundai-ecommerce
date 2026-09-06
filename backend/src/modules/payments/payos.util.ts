import crypto from "node:crypto";
import { CODE_PREFIX } from "@/common/constants/business.constant";

/**
 * Normalizes and sorts an object's keys alphabetically into a query string for HMAC signing.
 *
 * @param data - Object payload to sort and stringify.
 * @returns Sorted query string format: key=value&key2=value2.
 */
export function sortAndStringifyPayOSData(
  data: Record<string, unknown>,
): string {
  return Object.keys(data)
    .sort()
    .filter((key) => data[key] !== undefined)
    .map((key) => {
      let value = data[key];
      if (
        value === null ||
        value === undefined ||
        value === "null" ||
        value === "undefined"
      ) {
        value = "";
      } else if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      return `${key}=${String(value)}`;
    })
    .join("&");
}

/**
 * Computes the HMAC-SHA256 checksum signature for a PayOS data payload.
 *
 * @param data - Record data payload.
 * @param checksumKey - Merchant checksum secret key.
 * @returns Hex-encoded HMAC-SHA256 signature.
 */
export function generatePayOSSignature(
  data: Record<string, unknown>,
  checksumKey: string,
): string {
  if (!checksumKey || checksumKey.trim() === "") {
    throw new Error(
      "PayOS Checksum Key is required to compute HMAC-SHA256 signature.",
    );
  }
  const queryString = sortAndStringifyPayOSData(data);
  return crypto
    .createHmac("sha256", checksumKey)
    .update(queryString)
    .digest("hex");
}

/**
 * Cryptographically verifies that a webhook signature matches the payload in constant time.
 *
 * @param data - Webhook data payload.
 * @param signature - Signature provided in webhook request.
 * @param checksumKey - Merchant checksum secret key.
 * @returns True if signature is authentic; false otherwise.
 */
export function verifyPayOSSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string,
): boolean {
  if (!signature || !checksumKey || checksumKey.trim() === "") {
    return false;
  }
  try {
    const expected = generatePayOSSignature(data, checksumKey);
    const expectedBuf = Buffer.from(expected, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");
    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Generates a collision-resistant numeric order code within PayOS safe integer bounds.
 *
 * @returns Unique numeric identifier (safe integer ≤ 9007199254740991).
 */
export function generatePayOSOrderCode(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

/**
 * Formats an order description compliant with PayOS 25-character constraint.
 *
 * @param orderNumber - Business order number (e.g. ORD-20260906-8A3B1C4D2E5F).
 * @param orderId - Fallback internal order UUID.
 * @returns Description string truncated to at most 25 characters.
 */
export function formatPayOSDescription(
  orderNumber: string | null | undefined,
  orderId: string,
): string {
  if (orderNumber && orderNumber.trim() !== "") {
    return orderNumber.slice(0, 25);
  }
  const cleanId = orderId.replace(/-/g, "");
  return `${CODE_PREFIX.ORDER}-${cleanId}`.slice(0, 25);
}
