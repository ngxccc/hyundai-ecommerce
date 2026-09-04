import crypto from "node:crypto";

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
  checksumKey?: string,
): string {
  const key =
    typeof checksumKey === "string" && checksumKey.length > 0
      ? checksumKey
      : "dummy-checksum-key";
  const queryString = sortAndStringifyPayOSData(data);
  return crypto.createHmac("sha256", key).update(queryString).digest("hex");
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
  checksumKey?: string,
): boolean {
  if (!signature) {
    return false;
  }
  const key =
    typeof checksumKey === "string" && checksumKey.length > 0
      ? checksumKey
      : "dummy-checksum-key";
  try {
    const expected = generatePayOSSignature(data, key);
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
