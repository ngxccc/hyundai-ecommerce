import { randomBytes } from "node:crypto";

/**
 * Generates a human-friendly, collision-resistant business document code.
 *
 * Pattern: `${prefix}-${YYYYMMDD}-${randomSuffix}`
 * - Date part: YYYYMMDD in UTC (8 digits)
 * - Suffix: 12 uppercase alphanumeric characters combining milliseconds base36 (4 chars)
 *   and cryptographically secure random bytes (8 hex chars).
 *
 * Example: `RFQ-20260906-JDHC005DCA75`
 *
 * @param prefix Document code prefix (e.g. "RFQ", "ORD", "BG")
 * @returns Formatted business document code (25 characters, safe for varchar(32))
 */
export function generateDocumentCode(prefix: string): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const timeHex = Date.now().toString(36).toUpperCase().slice(-4);
  const randomHex = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${timeHex}${randomHex}`;
}
