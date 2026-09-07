import { Inject, Injectable } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nForbiddenException,
  I18nNotFoundException,
  I18nUnprocessableEntityException,
} from "@/common/exceptions";
import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  dealerTiers,
  orders,
  orderItems,
  outboxEvents,
  products,
  users,
  warehouseStocks,
} from "@/database/schemas";
import { type OrderStatus } from "@/database/schemas/enums.schema";
import { OUTBOX_EVENT_TYPE } from "@/common/constants/event.constant";
import { CODE_PREFIX } from "@/common/constants/business.constant";
import { generateDocumentCode } from "@/common/utils/code.util";
import {
  buildPaginationMeta,
  type PaginationMetaDto,
} from "@/common/dto/pagination-meta.dto";
import type { JwtPayload } from "@/common/decorators/current-user.decorator";
import type {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderQueryDto,
  OrderResponseDto,
} from "./dto";

/**
 * Valid state transitions for order lifecycle.
 */
const VALID_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB) {}

  /**
   * Places a retail order for guest customers without requiring prior account registration.
   *
   * @param dto - Guest customer contact information and line items to purchase.
   * @returns Created order record with initial PENDING status.
   * @throws NotFoundException if a requested product ID is not found.
   * @throws BadRequestException if requested quantity exceeds available stock or order creation fails.
   */
  async createGuestOrder(dto: CreateGuestOrderDto): Promise<OrderResponseDto> {
    const orderNumber = generateDocumentCode(CODE_PREFIX.ORDER);

    return this.db.transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToInsert: {
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
      }[] = [];
      const productsMap = new Map<
        string,
        {
          id: string;
          nameVi: string;
          nameEn: string | null;
          slug: string;
          price: string;
          images: string[];
          totalStockCache: number;
        }
      >();

      // Sort items deterministically by productId to prevent database deadlocks across concurrent transactions.
      const sortedItems = [...dto.items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      );

      for (const item of sortedItems) {
        // Acquire pessimistic write lock (FOR UPDATE) to serialize inventory deduction and prevent overselling.
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .for("update")
          .limit(1);

        if (!product) {
          throw new I18nNotFoundException("orders.PRODUCT_NOT_FOUND");
        }

        if (product.totalStockCache < item.quantity) {
          throw new I18nBadRequestException("orders.INSUFFICIENT_STOCK");
        }

        const priceNum = Number(product.price);
        subtotal += priceNum * item.quantity;

        await tx
          .update(products)
          .set({
            totalStockCache: sql`${products.totalStockCache} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));

        const stocks = await tx
          .select()
          .from(warehouseStocks)
          .where(
            and(
              eq(warehouseStocks.productId, item.productId),
              sql`${warehouseStocks.stock} > 0`,
            ),
          )
          .for("update")
          .limit(1);

        if (stocks.length > 0 && stocks[0]) {
          await tx
            .update(warehouseStocks)
            .set({
              stock: sql`GREATEST(0, ${warehouseStocks.stock} - ${item.quantity})`,
            })
            .where(
              and(
                eq(warehouseStocks.warehouseId, stocks[0].warehouseId),
                eq(warehouseStocks.productId, item.productId),
              ),
            );
        }

        productsMap.set(product.id, {
          id: product.id,
          nameVi: product.nameVi,
          nameEn: product.nameEn,
          slug: product.slug,
          price: product.price,
          images: product.images,
          totalStockCache: product.totalStockCache,
        });

        orderItemsToInsert.push({
          productId: product.id,
          productName: product.nameVi,
          productSku: product.slug,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      const totalAmount = subtotal.toFixed(2);

      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail ?? null,
          shippingAddress: dto.shippingAddress,
          totalAmount,
          shippingFee: "0.00",
          paymentMethod: dto.paymentMethod,
          status: "PENDING",
          paymentStatus: "PENDING",
          approvalStatus: "APPROVED",
          note: dto.note ?? null,
        })
        .returning();

      if (!newOrder) {
        throw new I18nBadRequestException("orders.ORDER_CREATE_FAILED");
      }

      const insertedItems = await tx
        .insert(orderItems)
        .values(
          orderItemsToInsert.map((item) => ({
            orderId: newOrder.id,
            ...item,
          })),
        )
        .returning();

      // Record transactional outbox event to guarantee reliable asynchronous order creation notification.
      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.ORDER_CREATED,
        payload: {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          customerEmail: newOrder.customerEmail,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
        },
      });

      return {
        ...newOrder,
        items: insertedItems.map((item) => ({
          ...item,
          product: productsMap.get(item.productId) ?? null,
        })),
        user: null,
      };
    });
  }

  /**
   * Creates an official B2B corporate order manually entered or approved by Admin/Sales.
   *
   * @param dto - B2B order specification with customer context, custom prices, and credit terms.
   * @param adminUserId - Authenticated admin/sales user ID creating the order.
   * @returns Created order record.
   * @throws NotFoundException if product is missing.
   * @throws BadRequestException if quantity exceeds available stock or order creation fails.
   */
  async createB2bOrder(
    dto: CreateB2bOrderDto,
    adminUserId: string,
  ): Promise<OrderResponseDto> {
    const orderNumber = generateDocumentCode(CODE_PREFIX.ORDER);

    return this.db.transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToInsert: {
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
      }[] = [];
      const productsMap = new Map<
        string,
        {
          id: string;
          nameVi: string;
          nameEn: string | null;
          slug: string;
          price: string;
          images: string[];
          totalStockCache: number;
        }
      >();

      // Sort items deterministically by productId to prevent database deadlocks across concurrent transactions.
      const sortedItems = [...dto.items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      );

      for (const item of sortedItems) {
        // Acquire pessimistic write lock (FOR UPDATE) to serialize inventory deduction and prevent overselling.
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .for("update")
          .limit(1);

        if (!product) {
          throw new I18nNotFoundException("orders.PRODUCT_NOT_FOUND");
        }

        if (product.totalStockCache < item.quantity) {
          throw new I18nBadRequestException("orders.INSUFFICIENT_STOCK");
        }

        const unitPriceNum =
          item.unitPrice !== undefined && item.unitPrice !== null
            ? Number(item.unitPrice)
            : Number(product.price);

        subtotal += unitPriceNum * item.quantity;

        await tx
          .update(products)
          .set({
            totalStockCache: sql`${products.totalStockCache} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));

        const stocks = await tx
          .select()
          .from(warehouseStocks)
          .where(
            and(
              eq(warehouseStocks.productId, item.productId),
              sql`${warehouseStocks.stock} > 0`,
            ),
          )
          .for("update")
          .limit(1);

        if (stocks.length > 0 && stocks[0]) {
          await tx
            .update(warehouseStocks)
            .set({
              stock: sql`GREATEST(0, ${warehouseStocks.stock} - ${item.quantity})`,
            })
            .where(
              and(
                eq(warehouseStocks.warehouseId, stocks[0].warehouseId),
                eq(warehouseStocks.productId, item.productId),
              ),
            );
        }
        productsMap.set(product.id, {
          id: product.id,
          nameVi: product.nameVi,
          nameEn: product.nameEn,
          slug: product.slug,
          price: product.price,
          images: product.images,
          totalStockCache: product.totalStockCache,
        });

        orderItemsToInsert.push({
          productId: product.id,
          productName: product.nameVi,
          productSku: product.slug,
          quantity: item.quantity,
          unitPrice: unitPriceNum.toFixed(2),
        });
      }

      const shippingFeeNum = Number(dto.shippingFee);
      const totalAmountNum = subtotal + shippingFeeNum;
      const depositAmountNum = Number(dto.depositAmount);
      const remainingAmountNum = Math.max(0, totalAmountNum - depositAmountNum);

      let userSummary: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
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
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: dto.userId ?? null,
          leadId: dto.leadId ?? null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail ?? null,
          companyName: dto.companyName ?? null,
          shippingAddress: dto.shippingAddress,
          shippingFee: shippingFeeNum.toFixed(2),
          totalAmount: totalAmountNum.toFixed(2),
          depositAmount: depositAmountNum.toFixed(2),
          remainingAmount: remainingAmountNum.toFixed(2),
          paymentMethod: dto.paymentMethod,
          status: "PENDING",
          paymentStatus:
            depositAmountNum >= totalAmountNum
              ? "FULLY_PAID"
              : depositAmountNum > 0
                ? "DEPOSIT_PAID"
                : "PENDING",
          approvalStatus: "APPROVED",
          approvedBy: adminUserId,
          note: dto.note ?? null,
        })
        .returning();

      if (!newOrder) {
        throw new I18nBadRequestException("orders.ORDER_CREATE_FAILED");
      }

      const insertedItems = await tx
        .insert(orderItems)
        .values(
          orderItemsToInsert.map((item) => ({
            orderId: newOrder.id,
            ...item,
          })),
        )
        .returning();
      // Record transactional outbox event to guarantee reliable asynchronous order creation notification.

      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.ORDER_CREATED,
        payload: {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          customerName: newOrder.customerName,
          companyName: newOrder.companyName,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
        },
      });

      return {
        ...newOrder,
        items: insertedItems.map((item) => ({
          ...item,
          product: productsMap.get(item.productId) ?? null,
        })),
        user: userSummary,
      };
    });
  }

  /**
   * Retrieves an order by unique UUID with items and customer details.
   *
   * @param id - Order UUID identifier.
   * @returns Detailed order response.
   * @throws NotFoundException if order does not exist.
   */
  async findById(id: string): Promise<OrderResponseDto> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new I18nNotFoundException("orders.ORDER_NOT_FOUND");
    }

    const items = await this.db
      .select({
        item: orderItems,
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
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    let userSummary = null;
    if (order.userId) {
      const [u] = await this.db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);

      if (u) {
        userSummary = u;
      }
    }

    return {
      ...order,
      items: items.map((r) => ({
        ...r.item,
        product: r.product?.id ? r.product : null,
      })),
      user: userSummary,
    };
  }

  /**
   * Retrieves paginated orders matching dynamic filtering options.
   *
   * @param query - Query filter parameters.
   * @returns Paginated list of order response dtos.
   */
  async findAll(query: OrderQueryDto): Promise<{
    items: OrderResponseDto[];
    meta: PaginationMetaDto;
  }> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.status) {
      conditions.push(eq(orders.status, query.status));
    }

    if (query.paymentStatus) {
      conditions.push(eq(orders.paymentStatus, query.paymentStatus));
    }

    if (query.paymentMethod) {
      conditions.push(eq(orders.paymentMethod, query.paymentMethod));
    }

    if (query.userId) {
      conditions.push(eq(orders.userId, query.userId));
    }

    if (query.customerPhone) {
      conditions.push(eq(orders.customerPhone, query.customerPhone));
    }

    if (query.search) {
      const searchPattern = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, searchPattern),
          ilike(orders.customerName, searchPattern),
          ilike(orders.customerPhone, searchPattern),
          ilike(orders.companyName, searchPattern),
        ),
      );
    }

    if (query.startDate) {
      conditions.push(gte(orders.createdAt, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(orders.createdAt, query.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult, orderList] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(whereClause),
      this.db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalCountResult[0]?.count ?? 0;

    if (orderList.length === 0) {
      return {
        items: [],
        meta: buildPaginationMeta(total, page, limit),
      };
    }

    const orderIds = orderList.map((o) => o.id);
    const userIds = [
      ...new Set(
        orderList
          .map((o) => o.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    // Batch fetch order items and user records in two parallel queries to eliminate N+1 cascade.
    const [allItems, allUsers] = await Promise.all([
      this.db
        .select({
          item: orderItems,
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
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds)),

      userIds.length > 0
        ? this.db
            .select({
              id: users.id,
              email: users.email,
              fullName: users.fullName,
              phoneNumber: users.phoneNumber,
              companyName: users.companyName,
              role: users.role,
              dealerTier: dealerTiers.nameVi,
            })
            .from(users)
            .leftJoin(dealerTiers, eq(users.dealerTierId, dealerTiers.id))
            .where(inArray(users.id, userIds))
        : Promise.resolve([]),
    ]);

    const itemsByOrderId = new Map<string, typeof allItems>();
    for (const record of allItems) {
      const list = itemsByOrderId.get(record.item.orderId) ?? [];
      list.push(record);
      itemsByOrderId.set(record.item.orderId, list);
    }

    const usersById = new Map<string, (typeof allUsers)[number]>();
    for (const u of allUsers) {
      usersById.set(u.id, u);
    }

    const fullItems = orderList.map((order) => {
      const orderItemsList = itemsByOrderId.get(order.id) ?? [];
      const userRecord = order.userId ? usersById.get(order.userId) : null;

      return {
        ...order,
        items: orderItemsList.map((r) => ({
          ...r.item,
          product: r.product?.id ? r.product : null,
        })),
        user: userRecord
          ? {
              id: userRecord.id,
              email: userRecord.email,
              fullName: userRecord.fullName,
              phoneNumber: userRecord.phoneNumber,
              companyName: userRecord.companyName,
              role: userRecord.role,
              dealerTier: userRecord.dealerTier ?? undefined,
            }
          : null,
      };
    });
    return {
      items: fullItems,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Updates order lifecycle status along the state machine.
   *
   * @param id - Order UUID identifier.
   * @param newStatus - Desired target order status.
   * @param adminUserId - Authenticated user approving/updating status.
   * @param note - Operational status update note.
   * @returns Updated order details.
   * @throws NotFoundException if order does not exist.
   * @throws UnprocessableEntityException if state transition is invalid or order is terminal.
   */
  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    adminUserId?: string,
    note?: string | null,
  ): Promise<OrderResponseDto> {
    const current = await this.findById(id);
    return this.applyStatusTransition(current, newStatus, adminUserId, note);
  }

  private async applyStatusTransition(
    current: OrderResponseDto,
    newStatus: OrderStatus,
    adminUserId?: string,
    note?: string | null,
  ): Promise<OrderResponseDto> {
    if (current.status === newStatus) {
      return current;
    }

    const allowed = VALID_ORDER_TRANSITIONS[current.status];
    if (!allowed.includes(newStatus)) {
      throw new I18nUnprocessableEntityException(
        "orders.INVALID_STATUS_TRANSITION",
      );
    }

    const updatedOrder = await this.db.transaction(async (tx) => {
      // Restock physical and cached warehouse inventory when cancelling an active order.
      if (newStatus === "CANCELLED") {
        for (const item of current.items) {
          await tx
            .update(products)
            .set({
              totalStockCache: sql`${products.totalStockCache} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));

          const stocks = await tx
            .select()
            .from(warehouseStocks)
            .where(eq(warehouseStocks.productId, item.productId))
            .for("update")
            .limit(1);

          if (stocks.length > 0 && stocks[0]) {
            await tx
              .update(warehouseStocks)
              .set({
                stock: sql`${warehouseStocks.stock} + ${item.quantity}`,
              })
              .where(
                and(
                  eq(warehouseStocks.warehouseId, stocks[0].warehouseId),
                  eq(warehouseStocks.productId, item.productId),
                ),
              );
          }
        }

        await tx.insert(outboxEvents).values({
          eventType: OUTBOX_EVENT_TYPE.ORDER_CANCELLED,
          payload: {
            orderId: current.id,
            orderNumber: current.orderNumber,
            reason: note ?? "Status updated to CANCELLED",
          },
        });
      } else if (newStatus === "PROCESSING") {
        await tx.insert(outboxEvents).values({
          eventType: OUTBOX_EVENT_TYPE.ORDER_CONFIRMED,
          payload: {
            orderId: current.id,
            orderNumber: current.orderNumber,
          },
        });
      }

      const [updated] = await tx
        .update(orders)
        .set({
          status: newStatus,
          approvedBy: adminUserId ?? current.approvedBy,
          note: note !== undefined ? note : current.note,
        })
        .where(eq(orders.id, current.id))
        .returning();

      return updated;
    });

    current.status = newStatus;
    current.approvedBy =
      updatedOrder?.approvedBy ?? adminUserId ?? current.approvedBy;
    current.note =
      updatedOrder?.note ?? (note !== undefined ? note : current.note);
    current.updatedAt = updatedOrder?.updatedAt ?? new Date();

    return current;
  }

  /**
   * Cancels an order and releases reserved warehouse inventory back into stock.
   *
   * @param id - Order UUID identifier.
   * @param note - Reason for cancellation.
   * @returns Updated cancelled order details.
   * @throws NotFoundException if order does not exist.
   * @throws BadRequestException if order is already cancelled or in shipping/delivered status.
   * @throws UnprocessableEntityException if order state transition is rejected by state machine.
   */
  async cancelOrder(
    id: string,
    note?: string | null,
    currentUser?: JwtPayload,
  ): Promise<OrderResponseDto> {
    const current = await this.findById(id);

    if (currentUser) {
      if (
        currentUser.role !== "ADMIN" &&
        currentUser.role !== "SALES" &&
        current.userId !== currentUser.sub
      ) {
        throw new I18nForbiddenException("orders.FORBIDDEN_CANCEL");
      }
    }

    if (current.status === "CANCELLED") {
      throw new I18nBadRequestException("orders.ORDER_ALREADY_CANCELLED");
    }

    if (current.status === "SHIPPED" || current.status === "DELIVERED") {
      throw new I18nBadRequestException("orders.ORDER_CANNOT_BE_CANCELLED");
    }

    return this.applyStatusTransition(
      current,
      "CANCELLED",
      currentUser?.sub,
      note,
    );
  }

  /**
   * Auto-expires pending unpaid orders beyond the expiration threshold and releases inventory (ADR 0012).
   *
   * @param windowMinutes - Inactivity duration before expiration (default 15 minutes).
   * @returns Total number of expired and cancelled orders.
   */
  async expirePendingOrders(windowMinutes = 15): Promise<number> {
    const cutoffDate = new Date(Date.now() - windowMinutes * 60 * 1000);

    const expiredList = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.status, "PENDING"),
          eq(orders.paymentStatus, "PENDING"),
          lte(orders.createdAt, cutoffDate),
        ),
      );

    for (const item of expiredList) {
      await this.cancelOrder(item.id, "Auto-expired: Payment timeout");
    }

    return expiredList.length;
  }
}
