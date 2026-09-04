import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  orders,
  orderItems,
  outboxEvents,
  products,
  users,
  warehouseStocks,
} from "@/database/schemas";
import { type OrderStatus } from "@/database/schemas/enums.schema";
import { OUTBOX_EVENT_TYPE } from "@/common/constants/event.constant";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import type {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderQueryDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
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
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Generates a human-readable order number matching corporate format.
   *
   * @returns Order identifier string (e.g. ORD-20260904-4821)
   */
  private generateOrderNumber(): string {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${todayStr}-${String(randomSuffix)}`;
  }

  /**
   * Places a retail order for guest customers without requiring prior account registration.
   *
   * @param dto - Guest customer contact information and line items to purchase.
   * @returns Created order record with initial PENDING status.
   * @throws NotFoundException if a requested product ID is not found.
   * @throws BadRequestException if requested quantity exceeds available stock.
   */
  async createGuestOrder(dto: CreateGuestOrderDto): Promise<OrderResponseDto> {
    const orderNumber = this.generateOrderNumber();

    const createdOrder = await this.db.transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToInsert: {
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
      }[] = [];

      for (const item of dto.items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product) {
          throw new NotFoundException(this.i18n.t("orders.PRODUCT_NOT_FOUND"));
        }

        if (product.totalStockCache < item.quantity) {
          throw new BadRequestException(
            this.i18n.t("orders.INSUFFICIENT_STOCK"),
          );
        }

        const priceNum = Number(product.price);
        subtotal += priceNum * item.quantity;

        // Atomic inventory deduction: Decrement totalStockCache
        await tx
          .update(products)
          .set({
            totalStockCache: sql`${products.totalStockCache} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));

        // Deduct from warehouse stock entries where available
        const stocks = await tx
          .select()
          .from(warehouseStocks)
          .where(
            and(
              eq(warehouseStocks.productId, item.productId),
              sql`${warehouseStocks.stock} > 0`,
            ),
          )
          .limit(1);

        if (stocks.length > 0 && stocks[0]) {
          await tx
            .update(warehouseStocks)
            .set({
              stock: sql`GREATEST(0, ${warehouseStocks.stock} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(warehouseStocks.warehouseId, stocks[0].warehouseId),
                eq(warehouseStocks.productId, item.productId),
              ),
            );
        }

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
        throw new BadRequestException(
          this.i18n.t("orders.ORDER_CREATE_FAILED"),
        );
      }

      for (const itemRecord of orderItemsToInsert) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          ...itemRecord,
        });
      }

      // Record Transactional Outbox domain event
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

      return newOrder;
    });

    return this.findById(createdOrder.id);
  }

  /**
   * Creates an official B2B corporate order manually entered or approved by Admin/Sales.
   *
   * @param dto - B2B order specification with customer context, custom prices, and credit terms.
   * @param adminUserId - Authenticated admin/sales user ID creating the order.
   * @returns Created order record.
   * @throws NotFoundException if product is missing.
   * @throws BadRequestException if quantity exceeds available stock.
   */
  async createB2bOrder(
    dto: CreateB2bOrderDto,
    adminUserId: string,
  ): Promise<OrderResponseDto> {
    const orderNumber = this.generateOrderNumber();

    const createdOrder = await this.db.transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToInsert: {
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
      }[] = [];

      for (const item of dto.items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product) {
          throw new NotFoundException(this.i18n.t("orders.PRODUCT_NOT_FOUND"));
        }

        if (product.totalStockCache < item.quantity) {
          throw new BadRequestException(
            this.i18n.t("orders.INSUFFICIENT_STOCK"),
          );
        }

        const unitPriceNum =
          item.unitPrice !== undefined && item.unitPrice !== null
            ? Number(item.unitPrice)
            : Number(product.price);

        subtotal += unitPriceNum * item.quantity;

        // Decrement stock
        await tx
          .update(products)
          .set({
            totalStockCache: sql`${products.totalStockCache} - ${item.quantity}`,
            updatedAt: new Date(),
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
          .limit(1);

        if (stocks.length > 0 && stocks[0]) {
          await tx
            .update(warehouseStocks)
            .set({
              stock: sql`GREATEST(0, ${warehouseStocks.stock} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(warehouseStocks.warehouseId, stocks[0].warehouseId),
                eq(warehouseStocks.productId, item.productId),
              ),
            );
        }
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
        throw new BadRequestException(
          this.i18n.t("orders.ORDER_CREATE_FAILED"),
        );
      }

      for (const itemRecord of orderItemsToInsert) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          ...itemRecord,
        });
      }

      // Record Outbox domain event
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

      return newOrder;
    });

    return this.findById(createdOrder.id);
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
      throw new NotFoundException(this.i18n.t("orders.ORDER_NOT_FOUND"));
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
  async findAll(query: OrderQueryDto): Promise<PaginatedOrderResponseDto> {
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

    const fullItems = await Promise.all(
      orderList.map((order) => this.findById(order.id)),
    );

    return {
      items: fullItems,
      total,
      page,
      limit,
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
   * @throws BadRequestException if transition is invalid or order is terminal.
   */
  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    adminUserId?: string,
    note?: string | null,
  ): Promise<OrderResponseDto> {
    const current = await this.findById(id);

    if (current.status === newStatus) {
      return current;
    }

    const allowed = VALID_ORDER_TRANSITIONS[current.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        this.i18n.t("orders.INVALID_STATUS_TRANSITION"),
      );
    }

    await this.db.transaction(async (tx) => {
      // If moving to CANCELLED, restock inventory atomically
      if (newStatus === "CANCELLED") {
        for (const item of current.items) {
          await tx
            .update(products)
            .set({
              totalStockCache: sql`${products.totalStockCache} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));

          const stocks = await tx
            .select()
            .from(warehouseStocks)
            .where(eq(warehouseStocks.productId, item.productId))
            .limit(1);

          if (stocks.length > 0 && stocks[0]) {
            await tx
              .update(warehouseStocks)
              .set({
                stock: sql`${warehouseStocks.stock} + ${item.quantity}`,
                updatedAt: new Date(),
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

      await tx
        .update(orders)
        .set({
          status: newStatus,
          approvedBy: adminUserId ?? current.approvedBy,
          note: note !== undefined ? note : current.note,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id));
    });

    return this.findById(id);
  }

  /**
   * Cancels an order and releases reserved warehouse inventory back into stock.
   *
   * @param id - Order UUID identifier.
   * @param note - Reason for cancellation.
   * @returns Updated cancelled order details.
   * @throws BadRequestException if order is already cancelled or in shipping/delivered status.
   */
  async cancelOrder(
    id: string,
    note?: string | null,
  ): Promise<OrderResponseDto> {
    const current = await this.findById(id);

    if (current.status === "CANCELLED") {
      throw new BadRequestException(
        this.i18n.t("orders.ORDER_ALREADY_CANCELLED"),
      );
    }

    if (current.status === "SHIPPED" || current.status === "DELIVERED") {
      throw new BadRequestException(
        this.i18n.t("orders.ORDER_CANNOT_BE_CANCELLED"),
      );
    }

    return this.updateStatus(id, "CANCELLED", undefined, note);
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
