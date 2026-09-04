import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const adminQuoteItemInputSchema = z.object({
  productId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  isCustomItem: z.boolean().default(false),
  itemName: zSanitizedString({ min: 1 }),
  itemModel: z.string().optional().nullable(),
  itemSpecs: z.string().optional().nullable(),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
  unitPrice: z.union([
    z.number().nonnegative({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  discountPercent: z
    .union([
      z.number().min(0).max(100),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
});

export const commercialTermsSchema = z.object({
  validityDays: z.number().int().positive().default(15),
  paymentSchedule: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  deliveryTime: z.string().optional().nullable(),
  deliveryLocation: z.string().optional().nullable(),
});

export const createAdminQuoteSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  customerName: zSanitizedString({ min: 2 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  vatRate: z.number().min(0).max(100).default(10),
  commercialTerms: commercialTermsSchema.optional().nullable(),
  note: z.string().optional().nullable(),
  expirationDate: z.coerce.date().optional().nullable(),
  items: z
    .array(adminQuoteItemInputSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type AdminQuoteItemInputDto = z.infer<typeof adminQuoteItemInputSchema>;
export type CommercialTermsDto = z.infer<typeof commercialTermsSchema>;
export type CreateAdminQuoteDto = z.infer<typeof createAdminQuoteSchema>;
