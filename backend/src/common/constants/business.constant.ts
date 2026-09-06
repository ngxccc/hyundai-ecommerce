/**
 * Standard business document and entity code prefixes.
 */
export const CODE_PREFIX = {
  /** Request for Quote / CRM Lead */
  LEAD: "RFQ",
  /** Sales Order */
  ORDER: "ORD",
  /** B2B Quotation */
  QUOTE: "BG",
  /** PayOS Payment Link */
  PAYMENT_LINK: "plink",
} as const;

export type CodePrefix = (typeof CODE_PREFIX)[keyof typeof CODE_PREFIX];
