export const FINANCIAL_CONSTANTS = {
  VAT_RATE: process.env["NEXT_PUBLIC_VAT_RATE"]
    ? parseFloat(process.env["NEXT_PUBLIC_VAT_RATE"])
    : process.env["VAT_RATE"]
      ? parseFloat(process.env["VAT_RATE"])
      : 0.1,
} as const;
