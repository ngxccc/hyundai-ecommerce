import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "0 ₫";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ₫";
  return priceFormatter.format(num);
}

export function formatNumberInput(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function parseNumberInput(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/[^\d]/g, "");
}

export function toInputValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return "";
}

export function toIntegerString(value: unknown): string {
  if (value === undefined || value === null) return "0";
  if (typeof value === "number") return Math.round(value).toString();
  if (typeof value === "string") {
    const num = parseInt(value, 10);
    return isNaN(num) ? "0" : String(num);
  }
  return "0";
}

export function formatShippingAddress(
  addressStr: string | null | undefined,
): string {
  if (!addressStr) return "";
  try {
    const parsed: unknown = JSON.parse(addressStr);
    if (typeof parsed === "object" && parsed !== null) {
      const record = parsed as Record<string, string | undefined>;
      const parts = [
        record.addressLine1 ?? record.streetAddress ?? record.address,
        record.ward,
        record.district,
        record.city ?? record.province,
      ].filter(Boolean);
      return parts.join(", ");
    }
  } catch {
    // Plain string
  }
  return addressStr;
}

const VIETNAMESE_DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const SCALE_UNITS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function readThreeDigits(triplet: number, readZeroHundreds: boolean): string {
  const hundreds = Math.floor(triplet / 100);
  const tens = Math.floor((triplet % 100) / 10);
  const ones = triplet % 10;
  const result: string[] = [];

  if (hundreds > 0 || readZeroHundreds) {
    result.push(`${VIETNAMESE_DIGITS[hundreds]} trăm`);
  }

  if (tens > 1) {
    result.push(`${VIETNAMESE_DIGITS[tens]} mươi`);
    if (ones === 1) {
      result.push("mốt");
    } else if (ones === 4) {
      result.push("tư");
    } else if (ones === 5) {
      result.push("lăm");
    } else if (ones > 0) {
      result.push(VIETNAMESE_DIGITS[ones]);
    }
  } else if (tens === 1) {
    result.push("mười");
    if (ones === 1) {
      result.push("một");
    } else if (ones === 5) {
      result.push("lăm");
    } else if (ones > 0) {
      result.push(VIETNAMESE_DIGITS[ones]);
    }
  } else if (tens === 0 && ones > 0) {
    if (hundreds > 0 || readZeroHundreds) {
      result.push("lẻ");
    }
    result.push(VIETNAMESE_DIGITS[ones]);
  }

  return result.join(" ");
}

export function numberToVietnameseWords(amount: number | string): string {
  const num =
    typeof amount === "string"
      ? Math.round(parseFloat(amount) || 0)
      : Math.round(amount || 0);

  if (num === 0) {
    return "Không đồng chẵn.";
  }

  if (num < 0) {
    return `Âm ${numberToVietnameseWords(Math.abs(num)).toLowerCase()}`;
  }

  const triplets: number[] = [];
  let temp = num;
  while (temp > 0) {
    triplets.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const words: string[] = [];
  for (let i = triplets.length - 1; i >= 0; i--) {
    const triplet = triplets[i];
    if (triplet > 0) {
      const readZeroHundreds = i < triplets.length - 1;
      const tripletText = readThreeDigits(triplet, readZeroHundreds);
      const unit = SCALE_UNITS[i] ?? "";
      if (tripletText) {
        words.push(unit ? `${tripletText} ${unit}` : tripletText);
      }
    }
  }

  const rawSentence = words.join(" ").trim();
  if (!rawSentence) return "Không đồng chẵn.";

  const formatted = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1);
  return `${formatted} đồng chẵn.`;
}
