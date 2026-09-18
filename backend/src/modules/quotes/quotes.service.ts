import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nForbiddenException,
  I18nNotFoundException,
  I18nUnprocessableEntityException,
} from "@/common/exceptions";
import { DATABASE_CONNECTION } from "@/database/database.module";
import type { DrizzleDB } from "@/database/database.module";
import {
  quotes,
  quoteItems,
  quoteMessages,
} from "@/database/schemas/quotes.schema";
import {
  products,
  productTranslations,
} from "@/database/schemas/product.schema";
import { users } from "@/database/schemas/auth.schema";
import { orders, orderItems } from "@/database/schemas/order.schema";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { CODE_PREFIX } from "@/common/constants/business.constant";
import { generateDocumentCode } from "@/common/utils/code.util";
import { daysToMs } from "@/common/utils/date.util";
import { DEFAULT_LOCALE } from "@/common/constants/locale.constant";
import {
  buildPaginationMeta,
  type PaginationMetaDto,
} from "@/common/dto/pagination-meta.dto";
import type { JwtPayload } from "@/common/decorators/current-user.decorator";
import type { QuoteStatus } from "@/database/schemas/enums.schema";
import type {
  AdminQuoteItemInputDto,
  AdminQuoteResponseDto,
  ApproveToOrderResponseDto,
  CreateAdminQuoteDto,
  CreateQuoteDto,
  QuoteMessageResponseDto,
  QuoteQueryDto,
  RfqResponseDto,
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
 * Dynamic column projections using Drizzle's getTableColumns:
 * Automatically selects all columns while omitting soft-delete timestamp.
 */
const { deletedAt: _deletedAt, ...adminQuoteColumns } = getTableColumns(quotes);
const adminQuoteItemColumns = getTableColumns(quoteItems);

/**
 * Service managing B2B quote negotiation lifecycle, state machine transitions,
 * server-side financial calculations, and atomic conversion to orders.
 */
@Injectable()
export class QuotesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB) {}

  /**
   * Submits a customer Request For Quotation (RFQ).
   * Official financial totals (subtotal, vat, totalQuotedPrice) are initialized to null until quoted by Sales.
   *
   * @param dto - Customer RFQ details and requested items.
   * @param userId - Optional registered customer ID.
   * @returns Newly created RFQ inquiry response.
   */
  async createRfq(
    dto: CreateQuoteDto,
    userId?: string,
  ): Promise<RfqResponseDto> {
    const quoteNumber = generateDocumentCode(CODE_PREFIX.QUOTE);

    const productIds = [
      ...new Set(
        dto.items
          .map((i) => i.productId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (productIds.length > 0) {
      const existingProducts = await this.db
        .select({ id: products.id })
        .from(products)
        .where(inArray(products.id, productIds));

      if (existingProducts.length !== productIds.length) {
        const foundIds = new Set(existingProducts.map((p) => p.id));
        const missingIds = productIds.filter((id) => !foundIds.has(id));
        throw new I18nNotFoundException("quotes.PRODUCTS_NOT_FOUND", {
          ids: missingIds.join(", "),
        });
      }
    }

    const itemsToInsert = dto.items.map((item) => {
      const isCustomItem = item.isCustomItem || !item.productId;

      return {
        productId: item.productId ?? null,
        isCustomItem,
        itemName: item.itemName,
        itemModel: item.itemModel ?? null,
        itemSpecs: item.itemSpecs ?? null,
        quantity: item.quantity,
        requestedPrice: item.requestedPrice ?? null,
        totalPrice: null,
      };
    });
    return this.db.transaction(async (tx) => {
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
          subtotalPrice: null,
          vatRate: null,
          vatAmount: null,
          totalQuotedPrice: null,
          note: dto.note ?? null,
        })
        .returning({
          id: quotes.id,
          quoteNumber: quotes.quoteNumber,
          status: quotes.status,
          customerName: quotes.customerName,
          customerPhone: quotes.customerPhone,
          customerEmail: quotes.customerEmail,
          companyName: quotes.companyName,
          taxId: quotes.taxId,
          shippingAddress: quotes.shippingAddress,
          note: quotes.note,
          createdAt: quotes.createdAt,
        });

      if (!newQuote) {
        throw new I18nBadRequestException("quotes.RFQ_CREATE_FAILED");
      }

      const insertedItems = await tx
        .insert(quoteItems)
        .values(
          itemsToInsert.map((item) => ({
            ...item,
            quoteId: newQuote.id,
          })),
        )
        .returning({
          id: quoteItems.id,
          productId: quoteItems.productId,
          isCustomItem: quoteItems.isCustomItem,
          itemName: quoteItems.itemName,
          itemModel: quoteItems.itemModel,
          itemSpecs: quoteItems.itemSpecs,
          quantity: quoteItems.quantity,
          requestedPrice: quoteItems.requestedPrice,
        });

      return {
        id: newQuote.id,
        quoteNumber: newQuote.quoteNumber ?? quoteNumber,
        status: newQuote.status,
        customerName: newQuote.customerName,
        customerPhone: newQuote.customerPhone,
        customerEmail: newQuote.customerEmail,
        companyName: newQuote.companyName,
        taxId: newQuote.taxId,
        shippingAddress: newQuote.shippingAddress,
        note: newQuote.note,
        items: insertedItems,
        createdAt: newQuote.createdAt,
      };
    });
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
  ): Promise<AdminQuoteResponseDto> {
    const quoteNumber = generateDocumentCode(CODE_PREFIX.QUOTE);

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
    if (!expirationDate) {
      const validityDays = dto.commercialTerms?.validityDays ?? 15;
      expirationDate = new Date(Date.now() + daysToMs(validityDays));
    }

    return this.db.transaction(async (tx) => {
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
          expirationDate: expirationDate,
          note: dto.note ?? null,
          createdByAdminId: adminUserId,
        })
        .returning(adminQuoteColumns);

      if (!newQuote) {
        throw new I18nBadRequestException("quotes.QUOTATION_PERSIST_FAILED");
      }

      const insertedItems = await tx
        .insert(quoteItems)
        .values(
          computedItems.map((item) => ({
            ...item,
            quoteId: newQuote.id,
          })),
        )
        .returning(adminQuoteItemColumns);

      const productIds = dto.items
        .map((i) => i.productId)
        .filter((id): id is string => Boolean(id));

      const productRecords =
        productIds.length > 0
          ? await tx
              .select({
                id: products.id,
                name: sql<string>`coalesce(${productTranslations.name}, '')`,
                slug: products.slug,
                price: products.price,
                images: products.images,
                totalStockCache: products.totalStockCache,
              })
              .from(products)
              .leftJoin(
                productTranslations,
                and(
                  eq(products.id, productTranslations.productId),
                  eq(productTranslations.locale, DEFAULT_LOCALE),
                ),
              )
              .where(inArray(products.id, productIds))
          : [];

      const productsMap = new Map(productRecords.map((p) => [p.id, p]));

      let userSummary: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: string;
      } | null = null;

      if (dto.userId) {
        const [u] = await tx
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phoneNumber: users.phoneNumber,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, dto.userId))
          .limit(1);

        if (u) {
          userSummary = u;
        }
      }

      return {
        ...newQuote,
        orderNumber: null,
        items: insertedItems.map((item) => ({
          ...item,
          product: item.productId
            ? (productsMap.get(item.productId) ?? null)
            : null,
        })),
        messages: [],
        user: userSummary,
      };
    });
  }

  /**
   * Retrieves paginated list of quotes with filtering options (Admin/Sales).
   *
   * @param query - Pagination and filtering parameters.
   * @returns Array of quotes and pagination total.
   */
  async findAll(query: QuoteQueryDto): Promise<{
    items: AdminQuoteResponseDto[];
    meta: PaginationMetaDto;
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
      .select({
        ...adminQuoteColumns,
        orderNumber: orders.orderNumber,
      })
      .from(quotes)
      .leftJoin(orders, eq(quotes.orderId, orders.id))
      .where(whereClause)
      .orderBy(desc(quotes.createdAt))
      .limit(limit)
      .offset(offset);
    if (quoteRecords.length === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(total, page, limit),
      };
    }

    const quoteIds = quoteRecords.map((q) => q.id);
    const userIds = [
      ...new Set(
        quoteRecords
          .map((q) => q.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [allItemRecords, allMessageRecords, allUsers] = await Promise.all([
      this.db
        .select({
          item: adminQuoteItemColumns,
          product: {
            id: products.id,
            name: sql<string>`coalesce(${productTranslations.name}, '')`,
            slug: products.slug,
            price: products.price,
            images: products.images,
            totalStockCache: products.totalStockCache,
          },
        })
        .from(quoteItems)
        .leftJoin(products, eq(quoteItems.productId, products.id))
        .leftJoin(
          productTranslations,
          and(
            eq(products.id, productTranslations.productId),
            eq(productTranslations.locale, DEFAULT_LOCALE),
          ),
        )
        .where(inArray(quoteItems.quoteId, quoteIds)),
      this.db
        .select({
          message: {
            id: quoteMessages.id,
            quoteId: quoteMessages.quoteId,
            senderId: quoteMessages.senderId,
            message: quoteMessages.message,
            createdAt: quoteMessages.createdAt,
            updatedAt: quoteMessages.updatedAt,
          },
          sender: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
          },
        })
        .from(quoteMessages)
        .leftJoin(users, eq(quoteMessages.senderId, users.id))
        .where(inArray(quoteMessages.quoteId, quoteIds))
        .orderBy(desc(quoteMessages.createdAt)),

      userIds.length > 0
        ? this.db
            .select({
              id: users.id,
              fullName: users.fullName,
              email: users.email,
              phoneNumber: users.phoneNumber,
              role: users.role,
            })
            .from(users)
            .where(inArray(users.id, userIds))
        : Promise.resolve([]),
    ]);

    const itemsByQuoteId = new Map<
      string,
      ((typeof allItemRecords)[number]["item"] & {
        product: (typeof allItemRecords)[number]["product"] | null;
      })[]
    >();
    for (const { item, product } of allItemRecords) {
      const list = itemsByQuoteId.get(item.quoteId) ?? [];
      list.push({
        ...item,
        product: product?.id ? product : null,
      });
      itemsByQuoteId.set(item.quoteId, list);
    }

    const messagesByQuoteId = new Map<
      string,
      ((typeof allMessageRecords)[number]["message"] & {
        sender: (typeof allMessageRecords)[number]["sender"] | null;
      })[]
    >();
    for (const { message, sender } of allMessageRecords) {
      const list = messagesByQuoteId.get(message.quoteId) ?? [];
      list.push({
        ...message,
        sender: sender?.id ? sender : null,
      });
      messagesByQuoteId.set(message.quoteId, list);
    }

    const usersById = new Map<string, (typeof allUsers)[number]>();
    for (const u of allUsers) {
      usersById.set(u.id, u);
    }

    const items: AdminQuoteResponseDto[] = quoteRecords.map((quote) => {
      const itemsList = itemsByQuoteId.get(quote.id) ?? [];
      const messagesList = messagesByQuoteId.get(quote.id) ?? [];
      const userSummary = quote.userId
        ? (usersById.get(quote.userId) ?? null)
        : null;

      return {
        ...quote,
        items: itemsList,
        messages: messagesList,
        user: userSummary,
      };
    });

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves single quote details by UUID with items, products, messages, and user summary (Admin/Sales).
   *
   * @param id - Quote UUID identifier.
   * @returns Detailed AdminQuoteResponseDto.
   */
  async findById(id: string): Promise<AdminQuoteResponseDto> {
    const [quote] = await this.db
      .select({
        ...adminQuoteColumns,
        orderNumber: orders.orderNumber,
      })
      .from(quotes)
      .leftJoin(orders, eq(quotes.orderId, orders.id))
      .where(eq(quotes.id, id))
      .limit(1);
    if (!quote) {
      throw new I18nNotFoundException("quotes.QUOTE_NOT_FOUND");
    }

    const itemRecords = await this.db
      .select({
        item: adminQuoteItemColumns,
        product: {
          id: products.id,
          name: sql<string>`coalesce(${productTranslations.name}, '')`,
          slug: products.slug,
          price: products.price,
          images: products.images,
          totalStockCache: products.totalStockCache,
        },
      })
      .from(quoteItems)
      .leftJoin(products, eq(quoteItems.productId, products.id))
      .leftJoin(
        productTranslations,
        and(
          eq(products.id, productTranslations.productId),
          eq(productTranslations.locale, DEFAULT_LOCALE),
        ),
      )
      .where(eq(quoteItems.quoteId, id));
    const items = itemRecords.map(({ item, product }) => ({
      ...item,
      product: product?.id ? product : null,
    }));

    const messageRecords = await this.db
      .select({
        message: {
          id: quoteMessages.id,
          quoteId: quoteMessages.quoteId,
          senderId: quoteMessages.senderId,
          message: quoteMessages.message,
          createdAt: quoteMessages.createdAt,
          updatedAt: quoteMessages.updatedAt,
        },
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
  ): Promise<AdminQuoteResponseDto> {
    const current = await this.findById(id);

    if (current.status === newStatus) {
      return current;
    }

    const allowedTransitions = VALID_QUOTE_TRANSITIONS[current.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new I18nUnprocessableEntityException(
        "quotes.INVALID_STATUS_TRANSITION",
      );
    }

    const updatePayload: Partial<typeof quotes.$inferInsert> = {
      status: newStatus,
    };

    if (newStatus === "NEGOTIATING" && !current.expirationDate) {
      const validityDays = current.commercialTerms?.validityDays ?? 15;
      const calculatedExpiry = new Date(Date.now() + daysToMs(validityDays));
      updatePayload.expirationDate = calculatedExpiry;
      current.expirationDate = calculatedExpiry;
    }

    const [updatedQuote] = await this.db
      .update(quotes)
      .set(updatePayload)
      .where(eq(quotes.id, id))
      .returning({
        updatedAt: quotes.updatedAt,
      });

    current.status = newStatus;
    current.updatedAt = updatedQuote?.updatedAt ?? new Date();
    return current;
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
  ): Promise<AdminQuoteResponseDto> {
    const quote = await this.findById(quoteId);

    if (
      quote.status === "APPROVED" ||
      quote.status === "REJECTED" ||
      quote.status === "EXPIRED"
    ) {
      throw new I18nBadRequestException("quotes.QUOTE_CANNOT_BE_MODIFIED");
    }

    const targetItem = quote.items.find((i) => i.id === itemId);
    if (!targetItem) {
      throw new I18nNotFoundException("quotes.QUOTE_ITEM_NOT_FOUND");
    }

    const agreedPriceNum = parseFloat(agreedPrice);
    const newAgreedLineTotal = agreedPriceNum * targetItem.quantity;

    await this.db.transaction(async (tx) => {
      await tx
        .update(quoteItems)
        .set({
          agreedPrice,
          totalPrice: newAgreedLineTotal.toFixed(2),
        })
        .where(eq(quoteItems.id, itemId));

      // Fetch all items with updated agreedPrice to deterministically recalculate parent quote totals
      const currentItems = await tx
        .select()
        .from(quoteItems)
        .where(eq(quoteItems.quoteId, quoteId));

      let newSubtotal = 0;
      for (const it of currentItems) {
        const linePrice = parseFloat(
          it.agreedPrice ?? it.finalUnitPrice ?? it.requestedPrice ?? "0",
        );
        newSubtotal += linePrice * it.quantity;
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
        })
        .where(eq(quotes.id, quoteId));
    });

    return await this.findById(quoteId);
  }

  /**
   * Posts negotiation timeline message and automatically advances SUBMITTED quotes to NEGOTIATING.
   *
   * @param quoteId - Parent quote UUID.
   * @param senderId - Authenticated sender UUID.
   * @param message - Message body content.
   * @param currentUser - Authenticated user context.
   * @returns Persisted quote message record.
   */
  async sendMessage(
    quoteId: string,
    senderId: string,
    message: string,
    currentUser?: JwtPayload,
  ): Promise<QuoteMessageResponseDto> {
    const quote = await this.findById(quoteId);

    // Enforce authorization: Admin, Sales, or the owning customer can message
    if (
      currentUser &&
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "SALES" &&
      quote.userId !== currentUser.sub
    ) {
      throw new I18nForbiddenException("quotes.FORBIDDEN_NEGOTIATION");
    }

    return await this.db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(quoteMessages)
        .values({
          quoteId,
          senderId,
          message,
        })
        .returning();

      if (!newMessage) {
        throw new I18nBadRequestException("quotes.MESSAGE_RECORD_FAILED");
      }

      // Auto-advance quote status from SUBMITTED to NEGOTIATING upon first negotiation dialogue
      if (quote.status === "SUBMITTED") {
        await tx
          .update(quotes)
          .set({
            status: "NEGOTIATING",
          })
          .where(eq(quotes.id, quoteId));
      }

      const [senderRecord] = await tx
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
        id: newMessage.id,
        quoteId: newMessage.quoteId,
        senderId: newMessage.senderId,
        message: newMessage.message,
        sender: senderRecord ?? null,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      };
    });
  }

  /**
   * Approves a quotation and atomically converts it into a pending order.
   *
   * @param quoteId - Parent quote UUID.
   * @param adminUserId - Authenticated admin user performing conversion.
   * @returns Created order confirmation and updated quote status.
   */
  async approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<ApproveToOrderResponseDto> {
    return await this.db.transaction(async (tx) => {
      const [quote] = await tx
        .select(adminQuoteColumns)
        .from(quotes)
        .where(eq(quotes.id, quoteId))
        .limit(1);

      if (!quote) {
        throw new I18nNotFoundException("quotes.QUOTE_NOT_FOUND");
      }

      if (quote.status === "APPROVED") {
        throw new I18nBadRequestException("quotes.QUOTE_ALREADY_CONVERTED");
      }
      if (quote.status === "REJECTED" || quote.status === "EXPIRED") {
        throw new I18nBadRequestException("quotes.INVALID_STATUS_TRANSITION");
      }

      const items = await tx
        .select({
          item: adminQuoteItemColumns,
          product: {
            id: products.id,
            name: sql<string>`coalesce(${productTranslations.name}, '')`,
            slug: products.slug,
          },
        })
        .from(quoteItems)
        .leftJoin(products, eq(quoteItems.productId, products.id))
        .leftJoin(
          productTranslations,
          and(
            eq(products.id, productTranslations.productId),
            eq(productTranslations.locale, DEFAULT_LOCALE),
          ),
        )
        .where(eq(quoteItems.quoteId, quoteId));

      if (items.length === 0) {
        throw new I18nBadRequestException("quotes.QUOTE_NO_ITEMS");
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
        const lineTotal = parseFloat(finalPrice) * item.quantity;
        totalAmountDecimal += lineTotal;

        if (item.productId) {
          orderItemsToInsert.push({
            productId: item.productId,
            productName: item.itemName,
            productSku: item.itemModel ?? product?.slug ?? "sku-quote-item",
            quantity: item.quantity,
            unitPrice: finalPrice,
          });
        }
      }

      const orderNumber = generateDocumentCode(CODE_PREFIX.ORDER);
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
        throw new I18nBadRequestException("quotes.ORDER_GENERATE_FAILED");
      }

      if (orderItemsToInsert.length > 0) {
        await tx.insert(orderItems).values(
          orderItemsToInsert.map((it) => ({
            ...it,
            orderId: newOrder.id,
          })),
        );
      }

      await tx
        .update(quotes)
        .set({
          status: "APPROVED",
          orderId: newOrder.id,
          totalQuotedPrice: totalAmountDecimal.toFixed(2),
        })
        .where(eq(quotes.id, quoteId));

      await tx.insert(quoteMessages).values({
        quoteId,
        senderId: adminUserId,
        message: `[HỆ THỐNG] Báo giá đã được phê duyệt và chuyển thành đơn hàng #${newOrder.id}`,
      });

      return {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        quoteId,
        status: "APPROVED",
      };
    });
  }
}
