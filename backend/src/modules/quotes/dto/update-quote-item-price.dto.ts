import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const updateQuoteItemPriceSchema = z.object({
  agreedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: i18nZodMsg("validation.isNumberString"),
  }),
});

export type UpdateQuoteItemPriceDtoType = z.infer<
  typeof updateQuoteItemPriceSchema
>;

export class UpdateQuoteItemPriceDto extends createZodDto(
  updateQuoteItemPriceSchema,
) {}
