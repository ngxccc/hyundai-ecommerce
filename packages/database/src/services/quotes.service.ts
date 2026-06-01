import { eq } from "drizzle-orm";
import { type IDatabase } from "../client";
import {
  quotes,
  quoteItems,
  quoteMessages,
  type TQuote,
  type TNewQuote,
  type TNewQuoteItem,
  type TNewQuoteMessage,
} from "../schemas/quotes.schema";

export class QuotesService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Create a new quote along with negotiating items inside a single database transaction
   */
  async createQuote(data: TNewQuote, items: Omit<TNewQuoteItem, "quoteId">[]) {
    return await this.db.transaction(async (tx) => {
      const [newQuote] = await tx.insert(quotes).values(data).returning();
      if (!newQuote) {
        throw new Error("Failed to create quote");
      }

      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          ...item,
          quoteId: newQuote.id,
        })) as TNewQuoteItem[];
        await tx.insert(quoteItems).values(itemsToInsert);
      }

      return newQuote;
    });
  }

  /**
   * Fetch complex quote details including associated dealer, items with product info, and negotiation chat logs
   */
  async getComplexQuote(quoteId: string) {
    return await this.db.query.quotes.findFirst({
      where: {
        id: quoteId,
      },
      with: {
        user: true,
        items: {
          with: {
            product: true,
          },
        },
        messages: {
          with: {
            sender: true,
          },
        },
      },
    });
  }

  /**
   * List quotes with optional filters by user ID (dealer) or quote status
   */
  async listQuotes(filters?: { userId?: string; status?: TQuote["status"] }) {
    const whereConditions: Record<string, { eq: string }> = {};
    if (filters?.userId) {
      whereConditions["userId"] = { eq: filters.userId };
    }
    if (filters?.status) {
      whereConditions["status"] = { eq: filters.status };
    }

    return await this.db.query.quotes.findMany({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      with: {
        user: true,
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update the status of a quote
   */
  async updateQuoteStatus(id: string, status: TQuote["status"]) {
    const [updated] = await this.db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  /**
   * Add a new negotiation chat message or activity log
   */
  async addQuoteMessage(data: TNewQuoteMessage) {
    const [message] = await this.db
      .insert(quoteMessages)
      .values(data)
      .returning();
    return message;
  }

  /**
   * Update the agreed negotiated price for a specific item in a quote
   */
  async updateQuoteItemPrice(itemId: string, agreedPrice: string) {
    const [updated] = await this.db
      .update(quoteItems)
      .set({ agreedPrice, updatedAt: new Date() })
      .where(eq(quoteItems.id, itemId))
      .returning();
    return updated;
  }
}

export type ComplexQuote = NonNullable<
  Awaited<ReturnType<typeof QuotesService.prototype.getComplexQuote>>
>;
