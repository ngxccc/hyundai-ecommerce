import { z } from "zod";
import { createZodDto } from "@/common/dto";
import {
  zOptionalEmail,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const guestOrderItemSchema = z.object({
  productId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
  quantity: z
    .number()
    .int({ message: i18nZodMsg("validation.isInt") })
    .positive({ message: i18nZodMsg("validation.isPositive") }),
});

export const createGuestOrderSchema = z.object({
  customerName: zSanitizedString({ min: 2, max: 100 }),
  customerPhone: zPhoneNumber(),
  customerEmail: zOptionalEmail(),
  shippingAddress: zSanitizedString({ min: 5, max: 500 }),
  paymentMethod: z.enum(PAYMENT_METHODS).default("PAYOS"),
  note: zSanitizedString({ max: 1000 }).optional().nullable(),
  items: z
    .array(guestOrderItemSchema)
    .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
});

export type GuestOrderItemDto = z.infer<typeof guestOrderItemSchema>;
export type CreateGuestOrderDtoType = z.infer<typeof createGuestOrderSchema>;

export class GuestOrderItemInputDto extends createZodDto(
  guestOrderItemSchema,
) {}
export class CreateGuestOrderDto extends createZodDto(createGuestOrderSchema) {}
