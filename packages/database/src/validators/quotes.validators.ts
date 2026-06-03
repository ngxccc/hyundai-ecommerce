import { z } from "zod";
import { quoteStatusEnum } from "../schemas/quotes.schema";

export const quoteIdSchema = z.object({
  quoteId: z.uuid(),
});

export const updateQuoteItemPriceSchema = z.object({
  quoteId: z.uuid(),
  itemId: z.uuid(),
  agreedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const sendQuoteMessageSchema = z.object({
  quoteId: z.uuid(),
  message: z.string().min(1),
});

export const updateQuoteStatusSchema = z.object({
  quoteId: z.uuid(),
  status: z.enum(quoteStatusEnum.enumValues),
});

export type TQuoteIdInput = z.infer<typeof quoteIdSchema>;
export type TUpdateQuoteItemPriceInput = z.infer<
  typeof updateQuoteItemPriceSchema
>;
export type TSendQuoteMessageInput = z.infer<typeof sendQuoteMessageSchema>;
export type TUpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
