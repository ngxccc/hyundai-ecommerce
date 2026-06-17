export const FINANCIAL_CONSTANTS = {
  VAT_RATE: process.env["VAT_RATE"] ? parseFloat(process.env["VAT_RATE"]) : 0.1,
  DEPOSIT_RATE: process.env["DEPOSIT_RATE"]
    ? parseFloat(process.env["DEPOSIT_RATE"])
    : 0.2,
} as const;
