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

export const formatNumberInput = (value: string) => {
  const number = value.replace(/\D/g, "");
  if (!number) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(number));
};
