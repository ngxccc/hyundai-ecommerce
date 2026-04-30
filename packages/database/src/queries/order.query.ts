import { db } from "..";

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
