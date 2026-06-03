export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export const formatNumberInput = (value: string | number) => {
  const number = typeof value === "string" ? value.replace(/\D/g, "") : value;
  if (!number) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(number));
};

export const formatCurrency = (val: string | number) => {
  const parsed = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(parsed);
};

export const toInputValue = (value: unknown) =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean"
    ? String(value)
    : "";

export const parseNumberInput = (value: string) => {
  return value.replace(/\D/g, "");
};

export const toIntegerString = (value: string | null | undefined) => {
  if (!value) return "";
  return value.split(".")[0] ?? "";
};
