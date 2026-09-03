import type { Quote, QuoteItem, QuoteMessage } from "../schemas/quotes.schema";

export interface AdminQuoteItemInputDTO {
  productId?: string | null | undefined;
  isCustomItem?: boolean | undefined;
  itemName: string;
  itemModel?: string | null | undefined;
  itemSpecs?: string | null | undefined;
  quantity: number;
  unitPrice: number | string;
  discountPercent?: number | string | undefined;
}

export interface CreateAdminQuoteDTO {
  userId?: string | null | undefined;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null | undefined;
  companyName?: string | null | undefined;
  taxId?: string | null | undefined;
  shippingAddress?: string | null | undefined;
  vatRate?: number | undefined;
  commercialTerms?: {
    validityDays?: number | undefined;
    paymentSchedule?: string | null | undefined;
    warrantyTerms?: string | null | undefined;
    deliveryTime?: string | null | undefined;
    deliveryLocation?: string | null | undefined;
  } | null | undefined;
  note?: string | null | undefined;
  expirationDate?: Date | null | undefined;
  createdByAdminId?: string | null | undefined;
  items: AdminQuoteItemInputDTO[];
}
export type QuoteDTO = Quote;
export type QuoteItemDTO = QuoteItem;
export type QuoteMessageDTO = QuoteMessage;
