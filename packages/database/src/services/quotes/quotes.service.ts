import type { QuotesService } from "../interfaces";
import { QUOTE_CONSTANTS } from "@nhatnang/shared/constants";
import { eq } from "drizzle-orm";
import { type IDatabase } from "../../client";
import {
  quotes,
  quoteItems,
  quoteMessages,
  orders,
  orderItems,
  type TQuote,
  type TNewQuote,
  type TNewQuoteItem,
  type TNewQuoteMessage,
} from "../../schemas";

export class DbQuotesService implements QuotesService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Create a new quote along with negotiating items inside a single database transaction
   */
  async createQuote(data: TNewQuote, items: Omit<TNewQuoteItem, "quoteId">[]) {
    return await this.db.transaction(async (tx) => {
      const [newQuote] = await tx.insert(quotes).values(data).returning();
      if (!newQuote) {
        throw new Error("errors.createQuoteFailed");
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

  /**
   * Approve a quote and atomically convert it into a standard Order inside a transaction
   */
  async approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<{ orderId: string }> {
    return await this.db.transaction(async (tx) => {
      // 1. Fetch quote details with items and products
      const quote = await tx.query.quotes.findFirst({
        where: { id: quoteId },
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });

      if (!quote) {
        throw new Error("errors.quoteNotFound");
      }
      if (quote.status === "approved") {
        throw new Error("errors.quoteAlreadyApproved");
      }
      if (quote.status === "rejected" || quote.status === "expired") {
        throw new Error("errors.quoteNotEditableOrConvertible");
      }

      // 2. Map items and compute total price
      let totalAmountDecimal = 0;
      const orderItemsToInsert = [];

      for (const item of quote.items) {
        // If agreedPrice is set, use it; otherwise fallback to requestedPrice
        const finalPrice = item.agreedPrice ?? item.requestedPrice;
        const subtotal = parseFloat(finalPrice) * item.quantity;
        totalAmountDecimal += subtotal;

        orderItemsToInsert.push({
          productId: item.productId,
          productName: item.product.nameVi,
          productSku: item.product.slug,
          quantity: item.quantity,
          unitPrice: finalPrice,
        });
      }

      // 3. Create the Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: quote.userId,
          status: "PENDING",
          shippingFee: "0.00",
          shippingAddress: QUOTE_CONSTANTS.DEFAULT_SHIPPING_ADDRESS,
          totalAmount: totalAmountDecimal.toFixed(2),
        })
        .returning();

      if (!newOrder) {
        throw new Error("errors.createOrderFailed");
      }

      // 4. Create Order Items linking to the new Order ID
      const finalOrderItems = orderItemsToInsert.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));
      await tx.insert(orderItems).values(finalOrderItems);

      // 5. Update parent Quote status to approved, locking negotiated parameters and linking orderId
      await tx
        .update(quotes)
        .set({
          status: "approved",
          orderId: newOrder.id,
          totalQuotedPrice: totalAmountDecimal.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quoteId));

      // 6. Log system notification in quote messages timeline
      await tx.insert(quoteMessages).values({
        quoteId: quoteId,
        senderId: adminUserId,
        message: `${QUOTE_CONSTANTS.SYSTEM_MESSAGE_APPROVED_PREFIX}${newOrder.id}`,
      });

      return { orderId: newOrder.id };
    });
  }
}

export type ComplexQuote = NonNullable<
  Awaited<ReturnType<typeof DbQuotesService.prototype.getComplexQuote>>
>;

export type QuoteListItem = Awaited<
  ReturnType<typeof DbQuotesService.prototype.listQuotes>
>[number];
