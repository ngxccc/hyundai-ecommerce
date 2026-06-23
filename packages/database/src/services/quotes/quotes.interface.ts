import type {
  TNewQuote,
  TNewQuoteItem,
  TQuoteItem,
  TNewQuoteMessage,
  TQuoteMessage,
  TQuote,
} from "../../schemas";
import type { ComplexQuote, QuoteListItem } from "./quotes.service";

export interface QuotesService {
  createQuote(
    data: TNewQuote,
    items: Omit<TNewQuoteItem, "quoteId">[],
  ): Promise<TQuote>;
  getComplexQuote(quoteId: string): Promise<ComplexQuote | undefined>;
  listQuotes(filters?: {
    userId?: string;
    status?: TQuote["status"];
  }): Promise<QuoteListItem[]>;
  updateQuoteStatus(
    id: string,
    status: TQuote["status"],
  ): Promise<TQuote | undefined>;
  addQuoteMessage(data: TNewQuoteMessage): Promise<TQuoteMessage | undefined>;
  updateQuoteItemPrice(
    itemId: string,
    agreedPrice: string,
  ): Promise<TQuoteItem | undefined>;
  approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<{ orderId: string }>;
}
