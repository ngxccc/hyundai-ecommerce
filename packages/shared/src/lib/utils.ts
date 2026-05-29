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

export const toInputValue = (value: unknown) =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean"
    ? String(value)
    : "";
