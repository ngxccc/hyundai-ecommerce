import type {
  NewQuote,
  NewQuoteItem,
  QuoteItem,
  NewQuoteMessage,
  QuoteMessage,
  Quote,
} from "../../schemas";
import type { CreateAdminQuoteDTO } from "../../dtos/quote.dto";
import type { ComplexQuote, QuoteListItem } from "./quotes.service";

export interface QuotesService {
  createQuote(
    data: NewQuote,
    items: Omit<NewQuoteItem, "quoteId">[],
  ): Promise<Quote>;
  createAdminQuote(dto: CreateAdminQuoteDTO): Promise<Quote>;
  getComplexQuote(quoteId: string): Promise<ComplexQuote | undefined>;
  listQuotes(filters?: {
    userId?: string;
    status?: Quote["status"];
  }): Promise<QuoteListItem[]>;
  updateQuoteStatus(
    id: string,
    status: Quote["status"],
  ): Promise<Quote | undefined>;
  addQuoteMessage(data: NewQuoteMessage): Promise<QuoteMessage | undefined>;
  sendAdminNegotiationMessage(params: {
    quoteId: string;
    adminUserId: string;
    message: string;
  }): Promise<QuoteMessage>;
  updateQuoteItemPrice(
    itemId: string,
    agreedPrice: string,
  ): Promise<QuoteItem | undefined>;
  approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<{ orderId: string }>;
}
