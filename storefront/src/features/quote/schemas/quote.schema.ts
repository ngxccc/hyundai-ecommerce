import { z } from "zod";
import { i18nZodMsg } from "@/shared/lib/i18n-zod";

export const submitQuoteItemSchema = z.object({
  productId: z.string().nullable().optional(),
  isCustomItem: z.boolean().default(false).optional(),
  itemName: z.string().trim().min(1, i18nZodMsg("Quote.itemNameRequired")),
  itemModel: z.string().trim().nullable().optional(),
  itemSpecs: z.string().trim().nullable().optional(),
  quantity: z
    .number()
    .int(i18nZodMsg("Quote.quantityPositive"))
    .positive(i18nZodMsg("Quote.quantityPositive")),
  requestedPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, i18nZodMsg("validation.isNumberString"))
    .nullable()
    .optional()
    .or(z.literal("")),
});

export const submitQuoteSchema = z.object({
  customerName: z.string().trim().min(2, i18nZodMsg("Quote.fullNameRequired")),
  customerPhone: z
    .string()
    .trim()
    .min(8, i18nZodMsg("Quote.phoneRequired"))
    .max(20, i18nZodMsg("Quote.phoneRequired")),
  customerEmail: z
    .email(i18nZodMsg("validation.emailInvalid"))
    .nullable()
    .optional()
    .or(z.literal("")),
  companyName: z.string().trim().nullable().optional(),
  taxId: z.string().trim().nullable().optional(),
  shippingAddress: z.string().trim().nullable().optional(),
  note: z.string().trim().nullable().optional(),
  items: z
    .array(submitQuoteItemSchema)
    .min(1, i18nZodMsg("Quote.emptyItemsRequired")),
});

export type SubmitQuoteItemInput = z.infer<typeof submitQuoteItemSchema>;
export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;
