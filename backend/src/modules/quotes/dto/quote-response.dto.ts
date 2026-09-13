import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zCoerceDate } from "@/common/schemas/zod-primitives";
import {
  QUOTE_STATUSES,
  type QuoteStatus,
} from "@/database/schemas/enums.schema";

export const quoteCommercialTermsSchema = z.object({
  validityDays: z.number().int().positive().nullable().optional(),
  paymentSchedule: z.string().nullable().optional(),
  warrantyTerms: z.string().nullable().optional(),
  deliveryTime: z.string().nullable().optional(),
  deliveryLocation: z.string().nullable().optional(),
});

export const quoteItemProductSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  price: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  totalStockCache: z.number().int().nullable(),
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
  createdAt: zCoerceDate(),
  updatedAt: zCoerceDate(),
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
  senderId: z.uuid().nullable(),
  message: z.string(),
  sender: quoteMessageSenderSchema.nullable().optional(),
  createdAt: zCoerceDate(),
  updatedAt: zCoerceDate(),
});

export const quoteUserSummarySchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  role: z.string(),
});

/**
 * Official B2B Negotiation Quotation Response Schema (CMS Cockpit / Admin / Sales).
 */
export const adminQuoteResponseSchema = z.object({
  id: z.uuid(),
  quoteNumber: z.string().nullable(),
  userId: z.uuid().nullable().optional(),
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
  createdAt: zCoerceDate(),
  updatedAt: zCoerceDate(),
  items: z.array(quoteItemResponseSchema),
  messages: z.array(quoteMessageResponseSchema).optional(),
  user: quoteUserSummarySchema.nullable().optional(),
});

export const quoteResponseSchema = adminQuoteResponseSchema;

export const paginatedAdminQuoteResponseSchema = z.object({
  items: z.array(adminQuoteResponseSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const paginatedQuoteResponseSchema = paginatedAdminQuoteResponseSchema;

export const approveToOrderResponseSchema = z.object({
  orderId: z.uuid(),
  quoteId: z.uuid(),
  status: z.enum(QUOTE_STATUSES),
});

/**
 * Public Customer RFQ (Request For Quotation) Item Response Schema.
 */
export const rfqItemResponseSchema = z.object({
  id: z.uuid(),
  productId: z.uuid().nullable().optional(),
  isCustomItem: z.boolean(),
  itemName: z.string().nullable(),
  itemModel: z.string().nullable().optional(),
  itemSpecs: z.string().nullable().optional(),
  quantity: z.number().int(),
  requestedPrice: z.string().nullable().optional(),
});

export const submitRfqItemResponseSchema = rfqItemResponseSchema;

/**
 * Public Customer RFQ (Request For Quotation) Response Schema.
 * Clean, lean, containing only initial inquiry acknowledgement without premature quoted prices or internal DB fields.
 */
export const rfqResponseSchema = z.object({
  id: z.uuid(),
  quoteNumber: z.string(),
  status: z.enum(QUOTE_STATUSES),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z.array(rfqItemResponseSchema),
  createdAt: zCoerceDate(),
});

export const submitRfqResponseSchema = rfqResponseSchema;

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

export class AdminQuoteResponseDto extends createZodDto(
  adminQuoteResponseSchema,
) {}
export class QuoteResponseDto extends AdminQuoteResponseDto {}

export class PaginatedAdminQuoteResponseDto extends createZodDto(
  paginatedAdminQuoteResponseSchema,
) {}
export class PaginatedQuoteResponseDto extends PaginatedAdminQuoteResponseDto {}

export class ApproveToOrderResponseDto extends createZodDto(
  approveToOrderResponseSchema,
) {}

export class RfqItemResponseDto extends createZodDto(rfqItemResponseSchema) {}
export class SubmitRfqItemResponseDto extends RfqItemResponseDto {}

export class RfqResponseDto extends createZodDto(rfqResponseSchema) {}
export class SubmitRfqResponseDto extends RfqResponseDto {}
