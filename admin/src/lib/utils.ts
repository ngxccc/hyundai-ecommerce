/**
 * Cached singleton currency formatter for Vietnamese Dong (VND).
 * Avoids expensive Intl.NumberFormat re-instantiations on high-frequency renders.
 */
export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/**
 * Cached singleton number formatter for standard integer/decimal counts.
 */
export const numberFormatter = new Intl.NumberFormat("vi-VN");

/**
 * Cached singleton formatter for compact million displays (1 decimal place max).
 */
export const compactMillionFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

/**
 * Formats a numeric or string monetary value into standard Vietnamese currency (e.g. "165.000.000 ₫").
 *
 * @param value - Scalar monetary amount
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "0 ₫";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ₫";
  return priceFormatter.format(num);
}

/**
 * Smart price formatter converting high-value amounts (>= 1,000,000 VND) to compact "Tr" units,
 * or standard currency notation for lower amounts.
 *
 * @param value - Scalar price value
 * @returns Human-friendly formatted price string (e.g. "165 Tr" or "850.000 ₫")
 */
export function formatPrice(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "0 ₫";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  if (num >= 1000000) {
    return `${compactMillionFormatter.format(num / 1000000)} Tr`;
  }
  return priceFormatter.format(num);
}

/**
 * Formats a standard integer count with Vietnamese locale separators (e.g. 1.234).
 *
 * @param value - Scalar count or integer
 * @returns Formatted number string
 */
export function formatNumber(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return numberFormatter.format(num);
}

/**
 * Formats a monetary value into a compact abbreviated string (e.g. 1.2B, 450M, 15k).
 * Used primarily for chart tick labels and compact metric displays.
 *
 * @param value - Numeric monetary value in VND
 * @returns Abbreviated string representation
 */
export function formatVNDShort(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return String(value);
}

export function formatNumberInput(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return numberFormatter.format(num);
}

export function parseNumberInput(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/[^\d]/g, "");
}

export function toInputValue(value: unknown): string {
  if (value === null || value === undefined) return "";
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
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return String(Math.floor(num));
}

export function formatShippingAddress(
  addressStr: string | null | undefined,
): string {
  if (!addressStr) return "Chưa cập nhật";
  try {
    const parsed = JSON.parse(addressStr) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      const addr = parsed as {
        street?: string;
        ward?: string;
        district?: string;
        city?: string;
      };
      const parts = [addr.street, addr.ward, addr.district, addr.city].filter(
        Boolean,
      );
      return parts.length > 0 ? parts.join(", ") : addressStr;
    }
  } catch {
    // Fallback if not valid JSON
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
  const remainder = triplet % 100;
  const tens = Math.floor(remainder / 10);
  const units = remainder % 10;

  const words: string[] = [];

  if (hundreds > 0 || readZeroHundreds) {
    words.push(VIETNAMESE_DIGITS[hundreds] ?? "", "trăm");
  }

  if (tens > 1) {
    words.push(VIETNAMESE_DIGITS[tens] ?? "", "mươi");
    if (units === 1) {
      words.push("mốt");
    } else if (units === 5) {
      words.push("lăm");
    } else if (units > 0) {
      words.push(VIETNAMESE_DIGITS[units] ?? "");
    }
  } else if (tens === 1) {
    words.push("mười");
    if (units === 5) {
      words.push("lăm");
    } else if (units > 0) {
      words.push(VIETNAMESE_DIGITS[units] ?? "");
    }
  } else if (tens === 0 && units > 0) {
    if (hundreds > 0 || readZeroHundreds) {
      words.push("lẻ");
    }
    words.push(VIETNAMESE_DIGITS[units] ?? "");
  }

  return words.filter(Boolean).join(" ");
}

export function numberToVietnameseWords(amount: number | string): string {
  const numericAmount =
    typeof amount === "string"
      ? Math.floor(Number(amount))
      : Math.floor(amount);

  if (Number.isNaN(numericAmount) || numericAmount === 0) {
    return "Không đồng";
  }

  if (numericAmount < 0) {
    return `Âm ${numberToVietnameseWords(Math.abs(numericAmount)).toLowerCase()}`;
  }

  const groups: number[] = [];
  let remaining = numericAmount;

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const resultWords: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i] ?? 0;
    if (group > 0) {
      const isHighest = i === groups.length - 1;
      const groupText = readThreeDigits(group, !isHighest);
      const scale = SCALE_UNITS[i] ?? "";

      resultWords.push(groupText);
      if (scale) {
        resultWords.push(scale);
      }
    }
  }

  const fullSentence = `${resultWords.join(" ")} đồng`;
  return fullSentence.charAt(0).toUpperCase() + fullSentence.slice(1);
}
