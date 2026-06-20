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
