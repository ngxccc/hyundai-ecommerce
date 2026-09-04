import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
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

export class CreateCheckoutLinkDto implements CreateCheckoutLinkDtoType {
  public static readonly zodSchema = createCheckoutLinkSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
    description: "Order UUID identifier to create payment link for",
  })
  public orderId!: string;

  @ApiPropertyOptional({
    example: "FULL_PAYMENT",
    enum: PAYMENT_TRANSACTION_TYPES,
    description: "Transaction type (FULL_PAYMENT or DEPOSIT percentage)",
  })
  public transactionType: (typeof PAYMENT_TRANSACTION_TYPES)[number] =
    "FULL_PAYMENT";
  @ApiPropertyOptional({
    example: "https://hyundai-nhatnang.vn/checkout/success",
    description: "URL redirect after customer successfully completes payment",
  })
  public returnUrl?: string;

  @ApiPropertyOptional({
    example: "https://hyundai-nhatnang.vn/checkout/cancel",
    description: "URL redirect if customer cancels payment on gateway",
  })
  public cancelUrl?: string;
}
