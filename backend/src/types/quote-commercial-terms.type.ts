import { z } from "zod";

/**
 * Canonical Zod validation schema for B2B quotation commercial terms.
 * Single source of truth for validation, serialization, and database typing.
 */
export const quoteCommercialTermsSchema = z.object({
  validityDays: z.number().int().positive().optional().nullable(),
  paymentSchedule: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  deliveryTime: z.string().optional().nullable(),
  deliveryLocation: z.string().optional().nullable(),
});

/**
 * Inferred TypeScript type representing quotation commercial terms.
 */
export type QuoteCommercialTerms = z.infer<typeof quoteCommercialTermsSchema>;
