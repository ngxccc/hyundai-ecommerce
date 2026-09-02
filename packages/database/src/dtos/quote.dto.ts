import type { TQuote, TQuoteItem, TQuoteMessage } from "../schemas/quotes.schema";

export interface AdminQuoteItemInputDTO {
  productId?: string;
  isCustomItem?: boolean;
  itemName: string;
  itemModel?: string;
  itemSpecs?: string;
  quantity: number;
  unitPrice: number | string;
  discountPercent?: number | string;
}

export interface CreateAdminQuoteDTO {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  taxId?: string;
  shippingAddress?: string;
  vatRate?: number;
  commercialTerms?: {
    validityDays?: number;
    paymentSchedule?: string;
    warrantyTerms?: string;
    deliveryTime?: string;
    deliveryLocation?: string;
  };
  note?: string;
  expirationDate?: Date;
  createdByAdminId?: string;
  items: AdminQuoteItemInputDTO[];
}

export type QuoteDTO = TQuote;
export type QuoteItemDTO = TQuoteItem;
export type QuoteMessageDTO = TQuoteMessage;
