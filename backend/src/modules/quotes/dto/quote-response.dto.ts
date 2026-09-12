import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate, zCoerceDate } from "@/common/schemas/zod-primitives";
import {
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/database/schemas/enums.schema";

export const quoteCommercialTermsSchema = z.object({
  validityDays: z.number().int().default(15),
  paymentSchedule: z.string().nullable().optional(),
  warrantyTerms: z.string().nullable().optional(),
  deliveryTime: z.string().nullable().optional(),
  deliveryLocation: z.string().nullable().optional(),
});

export const quoteItemProductSummarySchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  slug: z.string(),
  price: z.string(),
  images: z.array(z.string()),
  totalStockCache: z.number().int(),
});

export const quoteItemResponseSchema = z.object({
  id: z.uuid(),
  quoteId: z.uuid(),
  productId: z.uuid().nullable(),
  isCustomItem: z.boolean(),
  itemName: z.string().nullable(),
  itemModel: z.string().nullable(),
  itemSpecs: z.string().nullable(),
  quantity: z.number().int(),
  unitPrice: z.string().nullable(),
  discountPercent: z.string().nullable(),
  finalUnitPrice: z.string().nullable(),
  totalPrice: z.string().nullable(),
  requestedPrice: z.string().nullable(),
  agreedPrice: z.string().nullable(),
  product: quoteItemProductSummarySchema.nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export const quoteMessageSenderSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  role: z.string(),
});

export const quoteMessageResponseSchema = z.object({
  id: z.uuid(),
  quoteId: z.uuid(),
  senderId: z.uuid(),
  message: z.string(),
  sender: quoteMessageSenderSchema.nullable().optional(),
  createdAt: zDate(),
  updatedAt: zDate(),
});

export const quoteUserSummarySchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
});

export const quoteResponseSchema = z.object({
  id: z.uuid(),
  quoteNumber: z.string().nullable(),
  userId: z.uuid().nullable(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
  companyName: z.string().nullable(),
  taxId: z.string().nullable(),
  shippingAddress: z.string().nullable(),
  status: z.enum(QUOTE_STATUSES),
  subtotalPrice: z.string().nullable(),
  vatRate: z.number().nullable(),
  vatAmount: z.string().nullable(),
  totalQuotedPrice: z.string().nullable(),
  commercialTerms: quoteCommercialTermsSchema.nullable().optional(),
  expirationDate: zCoerceDate().nullable(),
  note: z.string().nullable(),
  orderId: z.uuid().nullable(),
  createdByAdminId: z.uuid().nullable(),
  createdAt: zDate(),
  updatedAt: zDate(),
  items: z.array(quoteItemResponseSchema),
  messages: z.array(quoteMessageResponseSchema).optional(),
  user: quoteUserSummarySchema.nullable().optional(),
});

export const paginatedQuoteResponseSchema = z.object({
  items: z.array(quoteResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const approveToOrderResponseSchema = z.object({
  orderId: z.uuid(),
  quoteId: z.uuid(),
  status: z.enum(QUOTE_STATUSES),
});

export type { QuoteStatus };

export class QuoteCommercialTermsDto extends createZodDto(
  quoteCommercialTermsSchema,
) {}
export class QuoteItemProductSummaryDto extends createZodDto(
  quoteItemProductSummarySchema,
) {}
export class QuoteItemResponseDto extends createZodDto(
  quoteItemResponseSchema,
) {}
export class QuoteMessageSenderDto extends createZodDto(
  quoteMessageSenderSchema,
) {}
export class QuoteMessageResponseDto extends createZodDto(
  quoteMessageResponseSchema,
) {}
export class QuoteUserSummaryDto extends createZodDto(quoteUserSummarySchema) {}
export class QuoteResponseDto extends createZodDto(quoteResponseSchema) {}
export class PaginatedQuoteResponseDto extends createZodDto(
  paginatedQuoteResponseSchema,
) {}
export class ApproveToOrderResponseDto extends createZodDto(
  approveToOrderResponseSchema,
) {}
