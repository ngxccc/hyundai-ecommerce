import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for PayOS webhook inner transaction details.
 */
export const payOSWebhookDataSchema = z
  .object({
    orderCode: z.number(i18nZodMsg("validation.isInt")),
    amount: z.number(i18nZodMsg("validation.isInt")),
    description: z.string(i18nZodMsg("validation.isString")),
    accountNumber: z.string(i18nZodMsg("validation.isString")),
    reference: z.string(i18nZodMsg("validation.isString")),
    transactionDateTime: z.string(i18nZodMsg("validation.isString")),
    currency: z.string(i18nZodMsg("validation.isString")),
    paymentLinkId: z.string(i18nZodMsg("validation.isString")),
    code: z.string(i18nZodMsg("validation.isString")),
    desc: z.string(i18nZodMsg("validation.isString")),
    counterAccountBankId: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
    counterAccountBankName: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
    counterAccountName: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
    counterAccountNumber: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
    virtualAccountName: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
    virtualAccountNumber: z
      .string(i18nZodMsg("validation.isString"))
      .nullable()
      .optional(),
  })
  .strict();

export type PayOSWebhookDataType = z.infer<typeof payOSWebhookDataSchema>;

/**
 * Data Transfer Object for PayOS transaction payload details.
 */
export class PayOSWebhookDataDto implements PayOSWebhookDataType {
  public static readonly zodSchema = payOSWebhookDataSchema;

  @ApiProperty({ example: 123456, description: "PayOS unique order code" })
  public orderCode!: number;

  @ApiProperty({ example: 200000, description: "Payment amount in VND" })
  public amount!: number;

  @ApiProperty({
    example: "Thanh toan ve xem phim",
    description: "Payment description string",
  })
  public description!: string;

  @ApiProperty({
    example: "1234567890",
    description: "PayOS receiving bank account number",
  })
  public accountNumber!: string;

  @ApiProperty({
    example: "FT2401019999",
    description: "Banking system transaction reference",
  })
  public reference!: string;

  @ApiProperty({
    example: "2026-08-30 10:00:00",
    description: "Transaction datetime formatted string",
  })
  public transactionDateTime!: string;

  @ApiProperty({ example: "VND", description: "Currency unit" })
  public currency!: string;

  @ApiProperty({ example: "link123", description: "Payment link ID" })
  public paymentLinkId!: string;

  @ApiProperty({ example: "00", description: "PayOS payment status code" })
  public code!: string;

  @ApiProperty({ example: "success", description: "Status description" })
  public desc!: string;

  @ApiProperty({ example: null, required: false, nullable: true })
  public counterAccountBankId?: string | null;

  @ApiProperty({ example: null, required: false, nullable: true })
  public counterAccountBankName?: string | null;

  @ApiProperty({ example: null, required: false, nullable: true })
  public counterAccountName?: string | null;

  @ApiProperty({ example: null, required: false, nullable: true })
  public counterAccountNumber?: string | null;

  @ApiProperty({ example: null, required: false, nullable: true })
  public virtualAccountName?: string | null;

  @ApiProperty({ example: null, required: false, nullable: true })
  public virtualAccountNumber?: string | null;
}

/**
 * Validation schema for PayOS webhook notification payload.
 */
export const payOSWebhookSchema = z
  .object({
    code: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, i18nZodMsg("validation.isNotEmpty")),
    desc: z.string(i18nZodMsg("validation.isString")),
    data: payOSWebhookDataSchema,
    signature: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, i18nZodMsg("validation.isNotEmpty")),
  })
  .strict();

export type PayOSWebhookDtoType = z.infer<typeof payOSWebhookSchema>;

/**
 * Data Transfer Object for PayOS webhook notification payload.
 */
export class PayOSWebhookDto implements PayOSWebhookDtoType {
  public static readonly zodSchema = payOSWebhookSchema;

  @ApiProperty({ example: "00", description: "Webhook result code" })
  public code!: string;

  @ApiProperty({ example: "success", description: "Result description" })
  public desc!: string;

  @ApiProperty({
    type: PayOSWebhookDataDto,
    description: "PayOS transaction payload details",
  })
  public data!: PayOSWebhookDataDto;

  @ApiProperty({
    example: "a1b2c3d4e5f6...",
    description: "PayOS HMAC-SHA256 verification signature",
  })
  public signature!: string;
}

export class PayOSWebhookResponseDto {
  @ApiProperty({ example: true })
  public success!: boolean;

  @ApiProperty({ example: "Webhook processed successfully" })
  public message!: string;
}
