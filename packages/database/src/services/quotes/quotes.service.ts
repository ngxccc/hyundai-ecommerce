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
  type Quote,
  type NewQuote,
  type NewQuoteItem,
  type QuoteMessage,
  type NewQuoteMessage,
} from "../../schemas";
import type { CreateAdminQuoteDTO } from "../../validators";
export class DbQuotesService implements QuotesService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Create a new quote along with negotiating items inside a single database transaction
   */
  async createQuote(data: NewQuote, items: Omit<NewQuoteItem, "quoteId">[]) {
    return await this.db.transaction(async (tx) => {
      const [newQuote] = await tx.insert(quotes).values(data).returning({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        userId: quotes.userId,
        customerName: quotes.customerName,
        customerPhone: quotes.customerPhone,
        customerEmail: quotes.customerEmail,
        companyName: quotes.companyName,
        taxId: quotes.taxId,
        shippingAddress: quotes.shippingAddress,
        status: quotes.status,
        subtotalPrice: quotes.subtotalPrice,
        vatRate: quotes.vatRate,
        vatAmount: quotes.vatAmount,
        totalQuotedPrice: quotes.totalQuotedPrice,
        commercialTerms: quotes.commercialTerms,
        expirationDate: quotes.expirationDate,
        note: quotes.note,
        orderId: quotes.orderId,
        createdByAdminId: quotes.createdByAdminId,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      });
      if (!newQuote) {
        throw new Error("errors.createQuoteFailed");
      }

      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          ...item,
          quoteId: newQuote.id,
        })) as NewQuoteItem[];
        await tx.insert(quoteItems).values(itemsToInsert);
      }

      return newQuote;
    });
  }

  /**
   * Create an admin-generated B2B quote with server-calculated financials inside an atomic transaction
   *
   * @param dto Admin quote creation payload containing customer credentials, items, and commercial terms
   * @returns The persisted quote record
   */
  async createAdminQuote(dto: CreateAdminQuoteDTO): Promise<Quote> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error("errors.emptyQuoteItems");
    }

    // Generate unique corporate quote identifier with date partition
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `QT-${todayStr}-${randomSuffix}`;

    // Deterministically compute line item metrics server-side to prevent client tampering
    let subtotal = 0;
    const computedItems = dto.items.map((item) => {
      const unitPriceNum = Number(item.unitPrice);
      const discountPercentNum = Number(item.discountPercent ?? 0);
      const finalUnitPriceNum = unitPriceNum * (1 - discountPercentNum / 100);
      const lineTotalNum = finalUnitPriceNum * item.quantity;

      subtotal += lineTotalNum;

      return {
        productId: item.productId ?? null,
        isCustomItem: item.isCustomItem ?? !item.productId,
        itemName: item.itemName,
        itemModel: item.itemModel ?? null,
        itemSpecs: item.itemSpecs ?? null,
        quantity: item.quantity,
        unitPrice: unitPriceNum.toFixed(2),
        discountPercent: discountPercentNum.toFixed(2),
        finalUnitPrice: finalUnitPriceNum.toFixed(2),
        totalPrice: lineTotalNum.toFixed(2),
        requestedPrice: unitPriceNum.toFixed(2),
        agreedPrice: finalUnitPriceNum.toFixed(2),
      };
    });

    const vatRate = dto.vatRate ?? 10;
    const vatAmount = subtotal * (vatRate / 100);
    const totalQuotedPrice = subtotal + vatAmount;

    // Derive expiration date from commercial validity window if not explicitly provided
    let expirationDate = dto.expirationDate;
    if (!expirationDate && dto.commercialTerms?.validityDays) {
      expirationDate = new Date(
        Date.now() + dto.commercialTerms.validityDays * 24 * 60 * 60 * 1000,
      );
    }

    return await this.db.transaction(async (tx) => {
      const [newQuote] = await tx
        .insert(quotes)
        .values({
          quoteNumber,
          userId: dto.userId ?? null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail ?? null,
          companyName: dto.companyName ?? null,
          taxId: dto.taxId ?? null,
          shippingAddress: dto.shippingAddress ?? null,
          status: "approved",
          subtotalPrice: subtotal.toFixed(2),
          vatRate,
          vatAmount: vatAmount.toFixed(2),
          totalQuotedPrice: totalQuotedPrice.toFixed(2),
          commercialTerms: dto.commercialTerms ?? null,
          expirationDate: expirationDate ?? null,
          note: dto.note ?? null,
          createdByAdminId: dto.createdByAdminId ?? null,
        })
        .returning({
          id: quotes.id,
          quoteNumber: quotes.quoteNumber,
          userId: quotes.userId,
          customerName: quotes.customerName,
          customerPhone: quotes.customerPhone,
          customerEmail: quotes.customerEmail,
          companyName: quotes.companyName,
          taxId: quotes.taxId,
          shippingAddress: quotes.shippingAddress,
          status: quotes.status,
          subtotalPrice: quotes.subtotalPrice,
          vatRate: quotes.vatRate,
          vatAmount: quotes.vatAmount,
          totalQuotedPrice: quotes.totalQuotedPrice,
          commercialTerms: quotes.commercialTerms,
          expirationDate: quotes.expirationDate,
          note: quotes.note,
          orderId: quotes.orderId,
          createdByAdminId: quotes.createdByAdminId,
          createdAt: quotes.createdAt,
          updatedAt: quotes.updatedAt,
        });

      if (!newQuote) {
        throw new Error("errors.createQuoteFailed");
      }

      await tx.insert(quoteItems).values(
        computedItems.map((item) => ({
          ...item,
          quoteId: newQuote.id,
        })),
      );

      return newQuote;
    });
  }

  /**
   * Fetch complex quote details including associated dealer, items with product info, and negotiation chat logs
   */
  async getComplexQuote(quoteId: string) {
    if (
      !quoteId ||
      typeof quoteId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        quoteId,
      )
    ) {
      return undefined;
    }

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
  async listQuotes(filters?: { userId?: string; status?: Quote["status"] }) {
    const whereConditions =
      filters?.userId || filters?.status
        ? {
            ...(filters.userId ? { userId: { eq: filters.userId } } : {}),
            ...(filters.status ? { status: { eq: filters.status } } : {}),
          }
        : undefined;

    return await this.db.query.quotes.findMany({
      ...(whereConditions ? { where: whereConditions } : {}),
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
  async updateQuoteStatus(id: string, status: Quote["status"]) {
    const [updated] = await this.db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        userId: quotes.userId,
        customerName: quotes.customerName,
        customerPhone: quotes.customerPhone,
        customerEmail: quotes.customerEmail,
        companyName: quotes.companyName,
        taxId: quotes.taxId,
        shippingAddress: quotes.shippingAddress,
        status: quotes.status,
        subtotalPrice: quotes.subtotalPrice,
        vatRate: quotes.vatRate,
        vatAmount: quotes.vatAmount,
        totalQuotedPrice: quotes.totalQuotedPrice,
        commercialTerms: quotes.commercialTerms,
        expirationDate: quotes.expirationDate,
        note: quotes.note,
        orderId: quotes.orderId,
        createdByAdminId: quotes.createdByAdminId,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      });
    return updated;
  }

  /**
   * Add a new negotiation chat message or activity log
   */
  async addQuoteMessage(data: NewQuoteMessage) {
    const [message] = await this.db
      .insert(quoteMessages)
      .values(data)
      .returning({
        id: quoteMessages.id,
        quoteId: quoteMessages.quoteId,
        senderId: quoteMessages.senderId,
        message: quoteMessages.message,
        createdAt: quoteMessages.createdAt,
        updatedAt: quoteMessages.updatedAt,
      });
    return message;
  }

  /**
   * Atomically send an admin negotiation message, transitioning quote status to 'negotiating'
   * and recording timeline events within a single database transaction.
   */
  async sendAdminNegotiationMessage(params: {
    quoteId: string;
    adminUserId: string;
    message: string;
  }): Promise<QuoteMessage> {
    if (
      !params.quoteId ||
      typeof params.quoteId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        params.quoteId,
      )
    ) {
      throw new Error("errors.quoteNotFound");
    }

    return await this.db.transaction(async (tx) => {
      const [quote] = await tx
        .select({ id: quotes.id, status: quotes.status })
        .from(quotes)
        .where(eq(quotes.id, params.quoteId))
        .limit(1);

      if (!quote) {
        throw new Error("errors.quoteNotFound");
      }

      if (
        quote.status === "approved" ||
        quote.status === "rejected" ||
        quote.status === "expired"
      ) {
        throw new Error("errors.quoteNotEditableOrConvertible");
      }

      const [newMessage] = await tx
        .insert(quoteMessages)
        .values({
          quoteId: params.quoteId,
          senderId: params.adminUserId,
          message: params.message,
        })
        .returning({
          id: quoteMessages.id,
          quoteId: quoteMessages.quoteId,
          senderId: quoteMessages.senderId,
          message: quoteMessages.message,
          createdAt: quoteMessages.createdAt,
          updatedAt: quoteMessages.updatedAt,
        });

      if (!newMessage) {
        throw new Error("errors.createMessageFailed");
      }

      if (quote.status === "pending_review") {
        await tx
          .update(quotes)
          .set({ status: "negotiating", updatedAt: new Date() })
          .where(eq(quotes.id, params.quoteId));

        await tx.insert(quoteMessages).values({
          quoteId: params.quoteId,
          senderId: params.adminUserId,
          message:
            "[SYSTEM] Trạng thái báo giá chuyển sang: Đang thương lượng (negotiating)",
        });
      }

      return newMessage;
    });
  }

  /**
   * Update the agreed negotiated price for a specific item in a quote
   */
  async updateQuoteItemPrice(itemId: string, agreedPrice: string) {
    const [updated] = await this.db
      .update(quoteItems)
      .set({ agreedPrice, updatedAt: new Date() })
      .where(eq(quoteItems.id, itemId))
      .returning({
        id: quoteItems.id,
        quoteId: quoteItems.quoteId,
        productId: quoteItems.productId,
        isCustomItem: quoteItems.isCustomItem,
        itemName: quoteItems.itemName,
        itemModel: quoteItems.itemModel,
        itemSpecs: quoteItems.itemSpecs,
        quantity: quoteItems.quantity,
        unitPrice: quoteItems.unitPrice,
        discountPercent: quoteItems.discountPercent,
        finalUnitPrice: quoteItems.finalUnitPrice,
        totalPrice: quoteItems.totalPrice,
        requestedPrice: quoteItems.requestedPrice,
        agreedPrice: quoteItems.agreedPrice,
        createdAt: quoteItems.createdAt,
        updatedAt: quoteItems.updatedAt,
      });
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
      // 2. Validate registered customer requirement for Order conversion
      if (!quote.userId) {
        throw new Error(
          "errors.guestQuoteRequiresRegisteredUserToConvertOrder",
        );
      }

      // 3. Map items and compute total price
      let totalAmountDecimal = 0;
      const orderItemsToInsert: {
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
      }[] = [];

      for (const item of quote.items) {
        const finalPrice =
          item.agreedPrice ??
          item.finalUnitPrice ??
          item.requestedPrice ??
          item.unitPrice ??
          "0.00";
        const subtotal = parseFloat(finalPrice) * item.quantity;
        totalAmountDecimal += subtotal;

        const productName =
          item.itemName ?? item.product?.nameVi ?? "Custom Line Item";
        const productSku =
          item.itemModel ?? item.product?.slug ?? "custom-item-sku";

        // Only link catalog products with valid UUID to order items table
        if (item.productId) {
          orderItemsToInsert.push({
            productId: item.productId,
            productName,
            productSku,
            quantity: item.quantity,
            unitPrice: finalPrice,
          });
        }
      }

      // 4. Create the Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: quote.userId,
          status: "PENDING",
          shippingFee: "0.00",
          shippingAddress:
            quote.shippingAddress ?? QUOTE_CONSTANTS.DEFAULT_SHIPPING_ADDRESS,
          totalAmount: totalAmountDecimal.toFixed(2),
        })
        .returning({
          id: orders.id,
        });

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
