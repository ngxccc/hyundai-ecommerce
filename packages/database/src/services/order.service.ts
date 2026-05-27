import { eq, sql } from "drizzle-orm";
import { db, type IDatabase } from "../client";
import { orders, type TNewOrder, type TOrder } from "../schemas";

const complexOrderQueryConfig = {
  with: {
    items: {
      with: {
        product: true, // product ở order-item
      },
    },
    bids: true,
    users: true,
  },
} as const; // khoá cứng cấy ATS, không bị xuy luận thành any

export class OrderService {
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
}

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof OrderService.prototype.getComplexOrder>>
>;
