import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

export const parseNumberInput = (value: string) => value.replace(/\D/g, "");

export const formatNumberInput = (value: string | number) => {
  const number = typeof value === "string" ? parseNumberInput(value) : value;
  if (!number) return "";

  return numberFormatter.format(Number(number));
};

export const formatCurrency = (val: string | number) => {
  const parsed = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(parsed)) return "";

  return priceFormatter.format(parsed);
};

export const toInputValue = (value: unknown) =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean"
    ? String(value)
    : "";

export const toIntegerString = (value: string | null | undefined) => {
  if (!value) return "";
  return value.split(".")[0] ?? "";
};

export interface CheckoutTotals {
  subtotal: number;
  vat: number;
  totalAmount: number;
  depositAmount: number;
}

export function calculateCheckoutTotals(
  subtotal: number,
  vatRate: number,
  depositRate: number,
): CheckoutTotals {
  const vat = subtotal * vatRate;
  const totalAmount = subtotal + vat;
  const depositAmount = Math.round(totalAmount * depositRate);
  return {
    subtotal,
    vat,
    totalAmount,
    depositAmount,
  };
}

export function formatShippingAddress(addressStr: string | null | undefined): string {
  if (!addressStr) return "";
  try {
    const address = JSON.parse(addressStr) as {
      receiverName?: string;
      phoneNumber?: string;
      streetAddress?: string;
      district?: string;
      city?: string;
    };

    const parts: string[] = [];
    if (address.receiverName && address.phoneNumber) {
      parts.push(`${address.receiverName} - ${address.phoneNumber}`);
    } else if (address.receiverName) {
      parts.push(address.receiverName);
    } else if (address.phoneNumber) {
      parts.push(address.phoneNumber);
    }

    const addressLines: string[] = [];
    if (address.streetAddress) addressLines.push(address.streetAddress);
    if (address.district) addressLines.push(address.district);
    if (address.city) addressLines.push(address.city);

    if (addressLines.length > 0) {
      parts.push(addressLines.join(", "));
    }

    return parts.join(" | ");
  } catch (e) {
    return addressStr;
  }
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
      result.push(VIETNAMESE_DIGITS[ones]!);
    }
  } else if (tens === 1) {
    result.push("mười");
    if (ones === 1) {
      result.push("một");
    } else if (ones === 5) {
      result.push("lăm");
    } else if (ones > 0) {
      result.push(VIETNAMESE_DIGITS[ones]!);
    }
  } else if (tens === 0 && ones > 0) {
    if (hundreds > 0 || readZeroHundreds) {
      result.push("lẻ");
    }
    result.push(VIETNAMESE_DIGITS[ones]!);
  }

  return result.join(" ");
}

/**
 * Converts a VND numeric amount to standard Vietnamese words for contracts and quotes.
 * E.g., 55000000 -> "Năm mươi lăm triệu đồng chẵn."
 *
 * @param amount - Number or numeric string
 */
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
    const triplet = triplets[i]!;
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
