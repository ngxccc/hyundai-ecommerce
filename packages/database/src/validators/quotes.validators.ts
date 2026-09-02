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

export const adminQuoteItemInputSchema = z.object({
  productId: z.string().uuid().optional(),
  isCustomItem: z.boolean().default(false),
  itemName: z.string().min(1, "Item name must not be empty"),
  itemModel: z.string().optional(),
  itemSpecs: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d{1,2})?$/)]),
  discountPercent: z.union([z.number().min(0).max(100), z.string().regex(/^\d+(\.\d{1,2})?$/)]).default(0),
});

export const createAdminQuoteSchema = z.object({
  userId: z.string().uuid().optional(),
  customerName: z.string().min(2, "Customer name must have at least 2 characters"),
  customerPhone: z.string().regex(/^[0-9+() -]{8,20}$/, "Invalid phone number"),
  customerEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  shippingAddress: z.string().optional(),
  vatRate: z.number().int().min(0).max(20).default(10),
  commercialTerms: z.object({
    validityDays: z.number().int().positive().default(15),
    paymentSchedule: z.string().optional(),
    warrantyTerms: z.string().optional(),
    deliveryTime: z.string().optional(),
    deliveryLocation: z.string().optional(),
  }).optional(),
  note: z.string().optional(),
  expirationDate: z.date().optional(),
  createdByAdminId: z.string().uuid().optional(),
  items: z.array(adminQuoteItemInputSchema).min(1, "Quote must contain at least 1 item"),
});

export type TAdminQuoteItemInput = z.infer<typeof adminQuoteItemInputSchema>;
export type TCreateAdminQuoteInput = z.infer<typeof createAdminQuoteSchema>;

export type TQuoteIdInput = z.infer<typeof quoteIdSchema>;
export type TUpdateQuoteItemPriceInput = z.infer<
  typeof updateQuoteItemPriceSchema
>;
export type TSendQuoteMessageInput = z.infer<typeof sendQuoteMessageSchema>;
export type TUpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
