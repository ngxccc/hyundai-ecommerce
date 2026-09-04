import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
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

export type PayOSWebhookDataDto = z.infer<typeof payosWebhookDataSchema>;
export type PayOSWebhookDtoType = z.infer<typeof payosWebhookSchema>;

export class PayOSWebhookDataClass implements PayOSWebhookDataDto {
  @ApiProperty({ example: 1725451234567 })
  public orderCode!: number;

  @ApiProperty({ example: 490000000 })
  public amount!: number;

  @ApiProperty({ example: "ORD-20260904-4821" })
  public description!: string;

  @ApiPropertyOptional({ example: "123456789" })
  public accountNumber?: string;

  @ApiPropertyOptional({ example: "FT24248123456789" })
  public reference?: string;

  @ApiPropertyOptional({ example: "2026-09-04 15:30:00" })
  public transactionDateTime?: string;

  @ApiPropertyOptional({ example: "VND" })
  public currency?: string;

  @ApiPropertyOptional({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb91" })
  public paymentLinkId?: string;

  @ApiPropertyOptional({ example: "00" })
  public code?: string;

  @ApiPropertyOptional({ example: "Success" })
  public desc?: string;
}

export class PayOSWebhookDto implements PayOSWebhookDtoType {
  public static readonly zodSchema = payosWebhookSchema;

  @ApiProperty({ example: "00", description: "Response status code" })
  public code!: string;

  @ApiProperty({ example: "Success", description: "Response description" })
  public desc!: string;

  @ApiProperty({ example: true, description: "Success status flag" })
  public success!: boolean;

  @ApiProperty({
    type: () => PayOSWebhookDataClass,
    description: "Transaction data payload",
  })
  public data!: PayOSWebhookDataClass;

  @ApiProperty({
    example: "6c9b3a6e7a2e7b56b74c419b4eb14b9a...",
    description: "HMAC-SHA256 signature calculated with PayOS Checksum Key",
  })
  public signature!: string;
}
