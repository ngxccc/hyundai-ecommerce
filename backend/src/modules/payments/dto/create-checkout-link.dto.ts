import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_TRANSACTION_TYPES } from "@/database/schemas/enums.schema";

export const createCheckoutLinkSchema = z.object({
  orderId: z.uuid({ message: i18nZodMsg("validation.isUuid") }),
  transactionType: z
    .enum(PAYMENT_TRANSACTION_TYPES, {
      message: i18nZodMsg("validation.isIn"),
    })
    .default("FULL_PAYMENT"),
  returnUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type CreateCheckoutLinkDtoType = z.infer<
  typeof createCheckoutLinkSchema
>;

export class CreateCheckoutLinkDto extends createZodDto(
  createCheckoutLinkSchema,
) {}
