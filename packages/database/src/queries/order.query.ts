import { db, eq, orders, sql, type NewOrder, type Order } from "..";

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

// PREPARED STATEMENTS

export const getOrderById = db
  .select()
  .from(orders)
  .where(eq(orders.id, sql.placeholder("id")))
  .prepare("get_order_by_id");

export const getOrdersByUserId = db
  .select()
  .from(orders)
  .where(eq(orders.userId, sql.placeholder("userId")))
  .prepare("get_orders_by_user_id");

export const getOrdersByStatus = db
  .select()
  .from(orders)
  .where(eq(orders.status, sql.placeholder("status")))
  .prepare("get_orders_by_status");

// NORMAL QUERIES

export async function createOrder(data: NewOrder) {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

export const getComplexOrder = async (orderId: string) => {
  return await db.query.orders.findFirst({
    where: {
      id: orderId,
    },
    ...complexOrderQueryConfig,
  });
};

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof getComplexOrder>>
>;
