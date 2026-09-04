import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const updateQuoteItemPriceSchema = z.object({
  agreedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: i18nZodMsg("validation.isNumberString"),
  }),
});

export type UpdateQuoteItemPriceDtoType = z.infer<
  typeof updateQuoteItemPriceSchema
>;

export class UpdateQuoteItemPriceDto implements UpdateQuoteItemPriceDtoType {
  public static readonly zodSchema = updateQuoteItemPriceSchema;

  @ApiProperty({
    example: "26500000.00",
    description: "Agreed renegotiated unit price for quote line item (VND)",
  })
  public agreedPrice!: string;
}
