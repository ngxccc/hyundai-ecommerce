import { z } from "zod";
import {
  zEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const createQuoteItemSchema = z.object({
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
  requestedPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    })
    .optional()
    .nullable(),
});

export const createQuoteSchema = z.object({
  customerName: zSanitizedString({ min: 2 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zEmail().optional().nullable().or(z.literal("")),
  companyName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  items: z
    .array(createQuoteItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type CreateQuoteItemDto = z.infer<typeof createQuoteItemSchema>;
export type CreateQuoteDto = z.infer<typeof createQuoteSchema>;
