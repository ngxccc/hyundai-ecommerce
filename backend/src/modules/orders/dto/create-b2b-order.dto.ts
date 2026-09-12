import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  zOptionalEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const b2bOrderItemSchema = z.object({
  productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
  unitPrice: z
    .union([
      z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .optional()
    .nullable(),
});

export const createB2bOrderSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  leadId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  customerName: zSanitizedString({ min: 2, max: 100 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zOptionalEmail(),
  companyName: zSanitizedString({ max: 255 }).optional().nullable(),
  shippingAddress: zSanitizedString({ min: 5, max: 500 }),
  paymentMethod: z.enum(PAYMENT_METHODS).default("BANK_TRANSFER"),
  shippingFee: z
    .union([
      z.number().min(0),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
  depositAmount: z
    .union([
      z.number().min(0),
      z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: i18nZodMsg("validation.isNumberString"),
      }),
    ])
    .default(0),
  note: zSanitizedString({ max: 1000 }).optional().nullable(),
  items: z
    .array(b2bOrderItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type B2bOrderItemDto = z.infer<typeof b2bOrderItemSchema>;
export type CreateB2bOrderDtoType = z.infer<typeof createB2bOrderSchema>;

export class B2bOrderItemInputDto extends createZodDto(b2bOrderItemSchema) {}
export class CreateB2bOrderDto extends createZodDto(createB2bOrderSchema) {}
