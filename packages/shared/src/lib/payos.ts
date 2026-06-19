import crypto from "crypto";

export const PAYOS_SUCCESS_CODE = "00";

export interface PayOSRes<T> {
  code: string;
  desc: string;
  data: T;
  signature: string;
}

export interface PayOSWebhookData extends Record<string, unknown> {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId: string;
  counterAccountBankName: string;
  counterAccountName: string;
  counterAccountNumber: string;
  virtualAccountName: string;
  virtualAccountNumber: string;
}

export type PayOSWebhookBody = PayOSRes<PayOSWebhookData> & {
  success: boolean;
};

export interface PayOSPaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
  items?: { name: string; quantity: number; price: number }[];
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
}

export type PayOSPaymentRes = PayOSRes<{
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}>;

function sortObjDataByKey(
  object: Record<string, unknown>,
): Record<string, unknown> {
  const orderedObject: Record<string, unknown> = {};
  Object.keys(object)
    .sort()
    .forEach((key) => {
      orderedObject[key] = object[key];
    });
  return orderedObject;
}

export function sortAndStringify(data: Record<string, unknown>): string {
  return Object.keys(data)
    .sort()
    .filter((key) => data[key] !== undefined)
    .map((key) => {
      let value = data[key];
      // Sort nested object arrays if present
      if (value && Array.isArray(value)) {
        const arr = value as unknown[];
        value = JSON.stringify(
          arr.map((val) =>
            typeof val === "object" && val !== null
              ? sortObjDataByKey(val as Record<string, unknown>)
              : val,
          ),
        );
      }
      // Set empty string if null, undefined, "null", or "undefined"
      if (
        value === null ||
        value === undefined ||
        value === "null" ||
        value === "undefined"
      ) {
        value = "";
      }
      return `${key}=${String(value)}`;
    })
    .join("&");
}

export function generatePayOSSignature(
  data: Record<string, unknown>,
  checksumKey: string,
): string {
  const queryString = sortAndStringify(data);
  return crypto
    .createHmac("sha256", checksumKey)
    .update(queryString)
    .digest("hex");
}

export function verifyPayOSSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string,
): boolean {
  const calculatedSignature = generatePayOSSignature(data, checksumKey);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, "utf-8"),
      Buffer.from(signature, "utf-8"),
    );
  } catch {
    return false;
  }
}

export function generatePayOSOrderCode(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export async function createPayOSPaymentLink(
  requestData: PayOSPaymentRequest,
  credentials?: { clientId?: string; apiKey?: string; checksumKey?: string },
): Promise<PayOSPaymentRes> {
  const clientId = credentials?.clientId ?? process.env["PAYOS_CLIENT_ID"];
  const apiKey = credentials?.apiKey ?? process.env["PAYOS_API_KEY"];
  const checksumKey = credentials?.checksumKey ?? process.env["PAYOS_CHECKSUM_KEY"];

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Missing PayOS credentials (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY)");
  }

  const signature = generatePayOSSignature(
    requestData as unknown as Record<string, unknown>,
    checksumKey,
  );

  const response = await fetch(
    "https://api-merchant.payos.vn/v2/payment-requests",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        ...requestData,
        signature,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayOS API error: ${response.status} - ${errText}`);
  }

  return (await response.json()) as PayOSPaymentRes;
}
