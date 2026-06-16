import crypto from "crypto";
export interface PayOSWebhookData extends Record<string, unknown> {
  orderCode: number;
  amount: number;
  reference: string;
}

export interface PayOSWebhookBody {
  code: string;
  desc?: string;
  success?: boolean;
  data: PayOSWebhookData;
  signature: string;
}

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
  /**
    1. createHmac: Chuẩn bị cắm máy xay và chọn lưỡi dao (sha256) cùng nguyên liệu phụ gia bí mật (checksumKey).
    2. update: Bỏ hoa quả cần xay vào máy (queryString).
    3. digest("hex"): Bấm nút xay và rót sinh tố ra cốc thủy tinh đẹp mắt để sử dụng (hex string).
  */
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
