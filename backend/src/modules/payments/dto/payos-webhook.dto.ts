import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const payosWebhookDataSchema = z.object({
  orderCode: z.number(),
  amount: z.number(),
  description: z.string(),
  accountNumber: z.string().optional(),
  reference: z.string().optional(),
  transactionDateTime: z.string().optional(),
  currency: z.string().optional(),
  paymentLinkId: z.string().optional(),
  code: z.string().optional(),
  desc: z.string().optional(),
  counterAccountBankId: z.string().optional().nullable(),
  counterAccountBankName: z.string().optional().nullable(),
  counterAccountName: z.string().optional().nullable(),
  counterAccountNumber: z.string().optional().nullable(),
  virtualAccountName: z.string().optional().nullable(),
  virtualAccountNumber: z.string().optional().nullable(),
});

export const payosWebhookSchema = z.object({
  code: z.string(),
  desc: z.string(),
  success: z.boolean(),
  data: payosWebhookDataSchema,
  signature: z.string({ message: i18nZodMsg("validation.isNotEmpty") }),
});

export const payosWebhookResponseSchema = z.object({
  processed: z.boolean(),
  reason: z.string().optional(),
});

export type PayOSWebhookDataDto = z.infer<typeof payosWebhookDataSchema>;
export type PayOSWebhookDtoType = z.infer<typeof payosWebhookSchema>;
export type PayOSWebhookResponseDtoType = z.infer<
  typeof payosWebhookResponseSchema
>;

export class PayOSWebhookDataClass extends createZodDto(
  payosWebhookDataSchema,
) {}
export class PayOSWebhookDto extends createZodDto(payosWebhookSchema) {}
export class PayOSWebhookResponseDto extends createZodDto(
  payosWebhookResponseSchema,
) {}
