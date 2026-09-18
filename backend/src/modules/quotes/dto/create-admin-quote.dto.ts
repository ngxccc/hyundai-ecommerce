import { quoteCommercialTermsSchema } from "@/types/quote-commercial-terms.type";
import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  zCoerceDate,
  zOptionalEmail,
  zOptionalTaxId,
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

export const createAdminQuoteSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  customerName: zSanitizedString({ min: 2 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zOptionalEmail(),
  companyName: z.string().optional().nullable(),
  taxId: zOptionalTaxId(),
  shippingAddress: z.string().optional().nullable(),
  vatRate: z.number().min(0).max(100).default(10),
  commercialTerms: quoteCommercialTermsSchema.optional().nullable(),
  note: z.string().optional().nullable(),
  expirationDate: zCoerceDate().optional().nullable(),
  items: z
    .array(adminQuoteItemInputSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type AdminQuoteItemInputDtoType = z.infer<
  typeof adminQuoteItemInputSchema
>;
export type CreateAdminQuoteDtoType = z.infer<typeof createAdminQuoteSchema>;

export class AdminQuoteItemInputDto extends createZodDto(
  adminQuoteItemInputSchema,
) {}
export class CreateAdminQuoteDto extends createZodDto(createAdminQuoteSchema) {}
