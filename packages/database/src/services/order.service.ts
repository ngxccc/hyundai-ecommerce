import type { IOrderService } from "./interfaces";
import { and, eq, sql } from "drizzle-orm";
import { db, type IDatabase } from "../client";
import {
  orders,
  shippingBids,
  type TNewOrder,
  type TOrder,
  type TShippingBid,
  type TNewShippingBid,
} from "../schemas";

const complexOrderQueryConfig = {
  with: {
    items: {
      with: {
        product: true, // product ở order-item
      },
    },
    bids: true,
    user: true,
  },
} as const; // khoá cứng cấy ATS, không bị xuy luận thành any

export class OrderService implements IOrderService {
  constructor(protected readonly db: IDatabase) {}

  // PREPARED STATEMENTS
  static getOrderByIdStmt = db
    .select()
    .from(orders)
    .where(eq(orders.id, sql.placeholder("id")))
    .prepare("get_order_by_id");

  static getOrdersByUserIdStmt = db
    .select()
    .from(orders)
    .where(eq(orders.userId, sql.placeholder("userId")))
    .prepare("get_orders_by_user_id");

  static getOrdersByStatusStmt = db
    .select()
    .from(orders)
    .where(eq(orders.status, sql.placeholder("status")))
    .prepare("get_orders_by_status");

  // NORMAL QUERIES
  async list(filters?: { status?: TOrder["status"] }): Promise<ComplexOrder[]> {
    const whereConditions: Record<string, { eq: string }> = {};
    if (filters?.status) {
      whereConditions["status"] = { eq: filters.status };
    }

    return await this.db.query.orders.findMany({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      ...complexOrderQueryConfig,
      orderBy: { createdAt: "desc" },
    });
  }

  async createOrder(data: TNewOrder) {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: TOrder["status"]) {
    const [updated] = await this.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getComplexOrder(orderId: string) {
    return await this.db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      ...complexOrderQueryConfig,
    });
  }
  async createShippingBid(data: TNewShippingBid) {
    const [bid] = await this.db.insert(shippingBids).values(data).returning();
    return bid;
  }
  async selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<{ updatedOrder: TOrder; selectedBid: TShippingBid }> {
    return await this.db.transaction(async (tx) => {
      // 1. Deselect all bids for this order
      await tx
        .update(shippingBids)
        .set({ isSelected: false })
        .where(eq(shippingBids.orderId, orderId));
      // 2. Select the winning bid
      const [selectedBid] = await tx
        .update(shippingBids)
        .set({ isSelected: true })
        .where(
          and(eq(shippingBids.id, bidId), eq(shippingBids.orderId, orderId)),
        )
        .returning();
      if (!selectedBid) {
        throw new Error("errors.shippingBidNotFound");
      }
      // 3. Update order shippingFee
      const [updatedOrder] = await tx
        .update(orders)
        .set({ shippingFee: selectedBid.quotedPrice, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
      if (!updatedOrder) {
        throw new Error("errors.orderNotFound");
      }
      return { updatedOrder, selectedBid };
    });
  }
}

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof OrderService.prototype.getComplexOrder>>
>;
