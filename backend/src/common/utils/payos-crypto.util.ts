import { createHmac, timingSafeEqual } from "node:crypto";
import type { Webhook, WebhookData } from "@payos/node";

export type PayOSWebhookPayload = Webhook;
export type PayOSWebhookData = WebhookData;

/**
 * Sorts object keys alphabetically and converts to a query-like string: key1=value1&key2=value2
 */
export function sortAndFormatPayloadData(
  data: Record<string, unknown>,
): string {
  const sortedKeys = Object.keys(data).sort();
  const pairs: string[] = [];

  for (const key of sortedKeys) {
    const value = data[key];
    if (value === undefined || value === null) {
      pairs.push(`${key}=`);
    } else if (typeof value === "object") {
      pairs.push(`${key}=${JSON.stringify(value)}`);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      pairs.push(`${key}=${value.toString()}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      pairs.push(`${key}=${String(value)}`);
    }
  }

  return pairs.join("&");
}

/**
 * Verifies PayOS Webhook HMAC-SHA256 signature using the checksum key (INV-6)
 */
export function verifyPayOSSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string,
): boolean {
  if (!signature || !checksumKey) {
    return false;
  }

  const formattedData = sortAndFormatPayloadData(data);
  const calculatedSignature = createHmac("sha256", checksumKey)
    .update(formattedData)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "utf8");
  const calcBuffer = Buffer.from(calculatedSignature, "utf8");

  if (sigBuffer.length !== calcBuffer.length) {
    return false;
  }

  return timingSafeEqual(sigBuffer, calcBuffer);
}

/**
 * Verifies payload timestamp is within the 5-minute anti-replay window (INV-6)
 */
export function isPayOSTimestampValid(
  transactionDateTime: string,
  maxSkewSeconds = 300,
): boolean {
  if (!transactionDateTime) {
    return false;
  }

  const txTimestamp = new Date(transactionDateTime).getTime();
  if (Number.isNaN(txTimestamp)) {
    return false;
  }

  const now = Date.now();
  const skew = Math.abs(now - txTimestamp) / 1000;
  return skew <= maxSkewSeconds;
}

// Custom Epoch: 2026-01-01T00:00:00.000Z (maintains compact 12-15 digit order codes within 53-bit safe integer limits)
const CUSTOM_EPOCH = 1767225600000;
const WORKER_ID = Number(process.env["WORKER_ID"] ?? 1) % 10;
let sequenceCounter = 0;
let lastTimestamp = -1;

/**
 * Generates a collision-free numeric PayOS orderCode using an in-process monotonic sequence and custom epoch offset.
 * Guarantees strictly unique, positive integers within JS Number.MAX_SAFE_INTEGER (<= 9007199254740991).
 * Supports up to 1,000 unique orders per millisecond per worker instance.
 */
export function generatePayOSOrderCode(): number {
  let now = Date.now();

  if (now === lastTimestamp) {
    sequenceCounter = (sequenceCounter + 1) % 1000;
    if (sequenceCounter === 0) {
      // Wait for clock to tick forward to prevent sequence overflow in the same millisecond
      while (now <= lastTimestamp) {
        now = Date.now();
      }
    }
  } else {
    sequenceCounter = 0;
  }

  lastTimestamp = now;

  const timeOffset = Math.max(0, now - CUSTOM_EPOCH);
  return timeOffset * 10000 + WORKER_ID * 1000 + sequenceCounter;
}
