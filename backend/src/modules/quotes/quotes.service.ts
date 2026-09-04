import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  orderItems,
  orders,
  products,
  quoteItems,
  quoteMessages,
  quotes,
  users,
} from "@/database/schemas";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import type { QuoteStatus } from "@/database/schemas/enums.schema";
import type {
  AdminQuoteItemInputDto,
  ApproveToOrderResponseDto,
  CreateAdminQuoteDto,
  CreateQuoteDto,
  QuoteMessageResponseDto,
  QuoteQueryDto,
  QuoteResponseDto,
} from "./dto";

/**
 * Valid state transitions for quote negotiation lifecycle.
 */
const VALID_QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  DRAFT: ["SUBMITTED", "REJECTED"],
  SUBMITTED: ["NEGOTIATING", "APPROVED", "REJECTED", "EXPIRED"],
  NEGOTIATING: ["APPROVED", "REJECTED", "EXPIRED"],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
};

/**
 * Service managing B2B quote negotiation lifecycle, state machine transitions,
 * server-side financial calculations, and atomic conversion to orders.
 */
@Injectable()
export class QuotesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Submits a customer Request For Quotation (RFQ).
   *
   * @param dto - Customer RFQ details and requested items.
   * @param userId - Optional registered customer ID.
   * @returns Newly created Quote response.
   */
  async createRfq(
    dto: CreateQuoteDto,
    userId?: string,
  ): Promise<QuoteResponseDto> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `QT-${todayStr}-${String(randomSuffix)}`;

    let subtotal = 0;
    const itemsToInsert = dto.items.map((item) => {
      const requestedPriceNum = item.requestedPrice
        ? parseFloat(item.requestedPrice)
        : 0;
      const lineTotal = requestedPriceNum * item.quantity;
      subtotal += lineTotal;

      return {
        productId: item.productId ?? null,
        isCustomItem: item.isCustomItem,
        itemName: item.itemName,
        itemModel: item.itemModel ?? null,
        itemSpecs: item.itemSpecs ?? null,
        quantity: item.quantity,
        requestedPrice: item.requestedPrice ?? null,
        totalPrice: lineTotal > 0 ? lineTotal.toFixed(2) : null,
      };
    });

    const quoteRecord = await this.db.transaction(async (tx) => {
      const [newQuote] = await tx
        .insert(quotes)
        .values({
          quoteNumber,
          userId: userId ?? null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail ?? null,
          companyName: dto.companyName ?? null,
          taxId: dto.taxId ?? null,
          shippingAddress: dto.shippingAddress ?? null,
          status: "SUBMITTED",
          subtotalPrice: subtotal > 0 ? subtotal.toFixed(2) : "0.00",
          vatRate: 10,
          vatAmount: (subtotal * 0.1).toFixed(2),
          totalQuotedPrice: (subtotal * 1.1).toFixed(2),
          note: dto.note ?? null,
        })
        .returning();

      if (!newQuote) {
        throw new BadRequestException("Failed to create customer RFQ");
      }

      await tx.insert(quoteItems).values(
        itemsToInsert.map((item) => ({
          ...item,
          quoteId: newQuote.id,
        })),
      );

      return newQuote;
    });

    return this.findById(quoteRecord.id);
  }

  /**
   * Creates an admin B2B quotation with server-calculated financials and commercial terms.
   *
   * @param dto - Admin quotation payload containing items, discounts, and terms.
   * @param adminUserId - ID of the creating sales/admin user.
   * @returns Persisted and calculated quote record.
   */
  async createAdminQuote(
    dto: CreateAdminQuoteDto,
    adminUserId: string,
  ): Promise<QuoteResponseDto> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `QT-${todayStr}-${String(randomSuffix)}`;

    // Deterministically compute line item metrics server-side to prevent tampering
    let subtotal = 0;
    const computedItems = dto.items.map((item: AdminQuoteItemInputDto) => {
      const unitPriceNum = Number(item.unitPrice);
      const discountPercentNum = Number(item.discountPercent);
      const finalUnitPriceNum = unitPriceNum * (1 - discountPercentNum / 100);
      const lineTotalNum = finalUnitPriceNum * item.quantity;

      subtotal += lineTotalNum;

      return {
        productId: item.productId ?? null,
        isCustomItem: item.isCustomItem || !item.productId,
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

    const vatRate = dto.vatRate;
    const vatAmount = subtotal * (vatRate / 100);
    const totalQuotedPrice = subtotal + vatAmount;

    let expirationDate = dto.expirationDate;
    if (!expirationDate && dto.commercialTerms?.validityDays) {
      expirationDate = new Date(
        Date.now() + dto.commercialTerms.validityDays * 24 * 60 * 60 * 1000,
      );
    }

    const createdQuote = await this.db.transaction(async (tx) => {
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
          status: "DRAFT",
          subtotalPrice: subtotal.toFixed(2),
          vatRate,
          vatAmount: vatAmount.toFixed(2),
          totalQuotedPrice: totalQuotedPrice.toFixed(2),
          commercialTerms: dto.commercialTerms ?? null,
          expirationDate: expirationDate ?? null,
          note: dto.note ?? null,
          createdByAdminId: adminUserId,
        })
        .returning();

      if (!newQuote) {
        throw new BadRequestException("Failed to persist admin quotation");
      }

      await tx.insert(quoteItems).values(
        computedItems.map((item) => ({
          ...item,
          quoteId: newQuote.id,
        })),
      );

      return newQuote;
    });

    return this.findById(createdQuote.id);
  }

  /**
   * Retrieves paginated list of quotes with filtering options.
   *
   * @param query - Pagination and filtering parameters.
   * @returns Array of quotes and pagination total.
   */
  async findAll(query: QuoteQueryDto): Promise<{
    items: QuoteResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.userId) {
      conditions.push(eq(quotes.userId, query.userId));
    }

    if (query.status) {
      conditions.push(eq(quotes.status, query.status));
    }

    if (query.search?.trim()) {
      const pattern = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(quotes.quoteNumber, pattern),
          ilike(quotes.customerName, pattern),
          ilike(quotes.companyName, pattern),
          ilike(quotes.customerPhone, pattern),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRecord] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(quotes)
      .where(whereClause);

    const total = totalRecord?.count ?? 0;

    const quoteRecords = await this.db
      .select()
      .from(quotes)
      .where(whereClause)
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);

    const items = await Promise.all(
      quoteRecords.map((record) => this.findById(record.id)),
    );

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Retrieves single quote details by UUID with items, products, messages, and user summary.
   *
   * @param id - Quote UUID identifier.
   * @returns Detailed QuoteResponseDto.
   */
  async findById(id: string): Promise<QuoteResponseDto> {
    const [quote] = await this.db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id))
      .limit(1);

    if (!quote) {
      throw new NotFoundException(this.i18n.t("quotes.QUOTE_NOT_FOUND"));
    }

    // Fetch items with joined product summaries
    const itemRecords = await this.db
      .select({
        item: quoteItems,
        product: {
          id: products.id,
          nameVi: products.nameVi,
          nameEn: products.nameEn,
          slug: products.slug,
          price: products.price,
          images: products.images,
          totalStockCache: products.totalStockCache,
        },
      })
      .from(quoteItems)
      .leftJoin(products, eq(quoteItems.productId, products.id))
      .where(eq(quoteItems.quoteId, id));

    const items = itemRecords.map(({ item, product }) => ({
      ...item,
      product: product?.id ? product : null,
    }));

    // Fetch messages with sender summaries
    const messageRecords = await this.db
      .select({
        message: quoteMessages,
        sender: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role,
        },
      })
      .from(quoteMessages)
      .leftJoin(users, eq(quoteMessages.senderId, users.id))
      .where(eq(quoteMessages.quoteId, id))
      .orderBy(desc(quoteMessages.createdAt));

    const messages = messageRecords.map(({ message, sender }) => ({
      ...message,
      sender: sender?.id ? sender : null,
    }));

    // Fetch user details if customer is registered
    let userSummary = null;
    if (quote.userId) {
      const [u] = await this.db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, quote.userId))
        .limit(1);

      if (u) userSummary = u;
    }

    return {
      ...quote,
      commercialTerms:
        quote.commercialTerms as QuoteResponseDto["commercialTerms"],
      items,
      messages,
      user: userSummary,
    };
  }

  /**
   * Transitions quote state according to the formal B2B state machine.
   *
   * @param id - Quote UUID.
   * @param newStatus - Requested target status.
   * @returns Updated quote details.
   */
  async updateStatus(
    id: string,
    newStatus: QuoteStatus,
  ): Promise<QuoteResponseDto> {
    const current = await this.findById(id);

    if (current.status === newStatus) {
      return current;
    }

    const allowedTransitions = VALID_QUOTE_TRANSITIONS[current.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        this.i18n.t("quotes.INVALID_STATUS_TRANSITION"),
      );
    }

    await this.db
      .update(quotes)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id));

    return this.findById(id);
  }

  /**
   * Updates negotiated agreed price for a specific line item and recalculates quote totals.
   *
   * @param quoteId - Parent quote UUID.
   * @param itemId - Quote item UUID.
   * @param agreedPrice - New agreed unit price.
   * @returns Updated quote details.
   */
  async updateItemPrice(
    quoteId: string,
    itemId: string,
    agreedPrice: string,
  ): Promise<QuoteResponseDto> {
    const quote = await this.findById(quoteId);

    if (
      quote.status === "APPROVED" ||
      quote.status === "REJECTED" ||
      quote.status === "EXPIRED"
    ) {
      throw new BadRequestException(
        this.i18n.t("quotes.QUOTE_CANNOT_BE_MODIFIED"),
      );
    }

    await this.db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(quoteItems)
        .where(and(eq(quoteItems.id, itemId), eq(quoteItems.quoteId, quoteId)))
        .limit(1);

      if (!item) {
        throw new NotFoundException(this.i18n.t("quotes.QUOTE_ITEM_NOT_FOUND"));
      }

      const agreedPriceNum = parseFloat(agreedPrice);
      const newLineTotal = agreedPriceNum * item.quantity;

      await tx
        .update(quoteItems)
        .set({
          agreedPrice,
          totalPrice: newLineTotal.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(quoteItems.id, itemId));

      // Recalculate quote subtotal and VAT
      const allItems = await tx
        .select()
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, quoteId));

      let newSubtotal = 0;
      for (const it of allItems) {
        const price = parseFloat(
          it.id === itemId
            ? agreedPrice
            : (it.agreedPrice ?? it.unitPrice ?? "0"),
        );
        newSubtotal += price * it.quantity;
      }

      const vatRate = quote.vatRate ?? 10;
      const vatAmount = newSubtotal * (vatRate / 100);
      const totalQuotedPrice = newSubtotal + vatAmount;

      await tx
        .update(quotes)
        .set({
          subtotalPrice: newSubtotal.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          totalQuotedPrice: totalQuotedPrice.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quoteId));
    });

    return this.findById(quoteId);
  }

  /**
   * Appends a timeline negotiation message and advances SUBMITTED quotes to NEGOTIATING.
   *
   * @param quoteId - Quote UUID.
   * @param senderId - ID of message sender.
   * @param messageText - Text content of negotiation message.
   * @returns Newly created QuoteMessageResponseDto.
   */
  async sendMessage(
    quoteId: string,
    senderId: string,
    messageText: string,
  ): Promise<QuoteMessageResponseDto> {
    const quote = await this.findById(quoteId);

    if (
      quote.status === "APPROVED" ||
      quote.status === "REJECTED" ||
      quote.status === "EXPIRED"
    ) {
      throw new BadRequestException(
        this.i18n.t("quotes.QUOTE_CANNOT_BE_MODIFIED"),
      );
    }

    return await this.db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(quoteMessages)
        .values({
          quoteId,
          senderId,
          message: messageText,
        })
        .returning();

      if (!newMessage) {
        throw new BadRequestException("Failed to record quote message");
      }

      // Requirement: Timeline messaging advances state from SUBMITTED to NEGOTIATING
      if (quote.status === "SUBMITTED") {
        await tx
          .update(quotes)
          .set({ status: "NEGOTIATING", updatedAt: new Date() })
          .where(eq(quotes.id, quoteId));
      }

      const [sender] = await tx
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, senderId))
        .limit(1);

      return {
        ...newMessage,
        sender: sender ?? null,
      };
    });
  }

  /**
   * Approves quote and atomically converts it into a standard Order record inside a database transaction.
   *
   * @param quoteId - UUID of the quote to approve.
   * @param adminUserId - ID of the approving admin user.
   * @returns Conversion confirmation with created order ID.
   */
  async approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<ApproveToOrderResponseDto> {
    return await this.db.transaction(async (tx) => {
      const [quote] = await tx
        .select()
        .from(quotes)
        .where(eq(quotes.id, quoteId))
        .limit(1);

      if (!quote) {
        throw new NotFoundException(this.i18n.t("quotes.QUOTE_NOT_FOUND"));
      }

      if (quote.status === "APPROVED") {
        throw new BadRequestException(
          this.i18n.t("quotes.QUOTE_ALREADY_CONVERTED"),
        );
      }

      if (quote.status === "REJECTED" || quote.status === "EXPIRED") {
        throw new BadRequestException(
          this.i18n.t("quotes.INVALID_STATUS_TRANSITION"),
        );
      }

      if (!quote.userId) {
        throw new BadRequestException(
          this.i18n.t("quotes.QUOTE_NO_USER_ACCOUNT"),
        );
      }

      const items = await tx
        .select({
          item: quoteItems,
          product: products,
        })
        .from(quoteItems)
        .leftJoin(products, eq(quoteItems.productId, products.id))
        .where(eq(quoteItems.quoteId, quoteId));

      if (items.length === 0) {
        throw new BadRequestException(
          "Cannot convert quote with no line items",
        );
      }

      let totalAmountDecimal = 0;
      const orderItemsToInsert = [];

      for (const { item, product } of items) {
        const finalPrice =
          item.agreedPrice ??
          item.finalUnitPrice ??
          item.requestedPrice ??
          item.unitPrice ??
          "0.00";
        const subtotal = parseFloat(finalPrice) * item.quantity;
        totalAmountDecimal += subtotal;

        // Link catalog product if available
        if (item.productId) {
          orderItemsToInsert.push({
            productId: item.productId,
            productName:
              item.itemName ?? product?.nameVi ?? "Thiết bị máy phát điện",
            productSku: item.itemModel ?? product?.slug ?? "sku-quote-item",
            quantity: item.quantity,
            unitPrice: finalPrice,
          });
        }
      }

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${todayStr}-${String(randomSuffix)}`;
      // Create Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: quote.userId,
          status: "PENDING",
          shippingFee: "0.00",
          shippingAddress:
            quote.shippingAddress ?? "Tại kho bên bán hoặc chân công trình",
          totalAmount: totalAmountDecimal.toFixed(2),
        })
        .returning();

      if (!newOrder) {
        throw new BadRequestException("Failed to generate order from quote");
      }

      if (orderItemsToInsert.length > 0) {
        await tx.insert(orderItems).values(
          orderItemsToInsert.map((it) => ({
            ...it,
            orderId: newOrder.id,
          })),
        );
      }

      // Update parent Quote to APPROVED and link orderId
      await tx
        .update(quotes)
        .set({
          status: "APPROVED",
          orderId: newOrder.id,
          totalQuotedPrice: totalAmountDecimal.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quoteId));

      // Append system timeline message
      await tx.insert(quoteMessages).values({
        quoteId,
        senderId: adminUserId,
        message: `[HỆ THỐNG] Báo giá đã được phê duyệt và chuyển thành đơn hàng #${newOrder.id}`,
      });

      return {
        orderId: newOrder.id,
        quoteId,
        status: "APPROVED",
      };
    });
  }
}
