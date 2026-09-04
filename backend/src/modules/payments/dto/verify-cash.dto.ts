import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zSanitizedString } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const verifyCashPaymentSchema = z.object({
  amount: z.union([
    z.number().positive({ message: i18nZodMsg("validation.isPositive") }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, {
      message: i18nZodMsg("validation.isNumberString"),
    }),
  ]),
  note: zSanitizedString({ max: 500 }).optional().nullable(),
});

export type VerifyCashPaymentDtoType = z.infer<typeof verifyCashPaymentSchema>;

export class VerifyCashPaymentDto implements VerifyCashPaymentDtoType {
  public static readonly zodSchema = verifyCashPaymentSchema;

  @ApiProperty({
    example: 490000000,
    description: "Actual cash amount collected by accountant/cashier",
  })
  public amount!: number | string;

  @ApiPropertyOptional({
    example: "Đã thu đủ tiền mặt tại văn phòng Hà Nội ngày 04/09",
    description: "Optional verification notes or internal receipt code",
  })
  public note?: string | null;
}
