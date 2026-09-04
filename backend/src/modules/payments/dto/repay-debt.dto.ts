import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { PAYMENT_METHODS } from "@/database/schemas/enums.schema";

export const repayDebtSchema = z.object({
  userId: z
    .uuid({ message: i18nZodMsg("validation.isUuid") })
    .optional()
    .nullable(),
  amount: z.union([
    z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  paymentMethod: z
    .enum(PAYMENT_METHODS, { message: i18nZodMsg("validation.isIn") })
    .default("PAYOS"),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
  returnUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type RepayDebtDtoType = z.infer<typeof repayDebtSchema>;

export class RepayDebtDto implements RepayDebtDtoType {
  public static readonly zodSchema = repayDebtSchema;

  @ApiPropertyOptional({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "Target dealer user UUID if processed by Admin/Sales",
  })
  public userId?: string | null;

  @ApiProperty({
    example: 50000000,
    description: "Debt repayment amount in VND",
  })
  public amount!: number | string;

  @ApiPropertyOptional({
    example: "PAYOS",
    enum: PAYMENT_METHODS,
    description:
      "Payment method used for repayment (PAYOS, CASH, BANK_TRANSFER)",
  })
  public paymentMethod: (typeof PAYMENT_METHODS)[number] = "PAYOS";

  @ApiPropertyOptional({
    example: "Thanh toán công nợ lô máy phát điện tháng 08",
    description: "Repayment note or reference",
  })
  public note?: string | null;

  @ApiPropertyOptional({
    example: "https://hyundai-nhatnang.vn/portal/debt?repaymentSuccess=true",
    description: "Return URL after online payment completes",
  })
  public returnUrl?: string;

  @ApiPropertyOptional({
    example: "https://hyundai-nhatnang.vn/portal/debt?repaymentCancel=true",
    description: "Cancel URL if customer cancels payment",
  })
  public cancelUrl?: string;
}
