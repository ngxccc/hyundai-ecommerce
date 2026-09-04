import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

export const updateQuoteItemPriceSchema = z.object({
  agreedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: i18nZodMsg("validation.isNumberString"),
  }),
});

export type UpdateQuoteItemPriceDto = z.infer<
  typeof updateQuoteItemPriceSchema
>;
