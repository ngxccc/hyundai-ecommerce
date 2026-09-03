import type { DrizzleDB } from "@/database/database.module";
import {
  orderItems,
  orders,
  payments,
  quoteItems,
  quoteMessages,
  quotes,
  shippingBids,
} from "@/database/schemas";
import { isScopeActive, type SeedScope } from "../constants/seed.constant";
import type { Tier2SeedResult, Tier3SeedResult } from "../types/seed.type";
import {
  CUSTOMER_USER_ID,
  DEALER1_APPROVER_ID,
} from "./tier1-reference.seeder";
import { PRODUCT1_ID, PRODUCT3_ID } from "./tier2-catalog.seeder";

export const QUOTE1_ID = "019de1a0-9999-7000-8000-000000000001";
export const ORDER1_ID = "019de1a0-aaaa-761e-bb91-7c6ecf6377d8";
export const ORDER2_ID = "019de1a0-bbbb-761e-bb91-825a77b45568";

export async function seedTier3Operational(
  db: DrizzleDB,
  scopes: SeedScope[],
  _tier2Result?: Tier2SeedResult,
): Promise<Tier3SeedResult> {
  const result: Tier3SeedResult = {
    quotes: [],
    quoteItemsCount: 0,
    orders: [],
    orderItemsCount: 0,
  };

  // 1. Seed Quotes
  if (isScopeActive(scopes, "operational", "quotes")) {
    const quoteData = [
      {
        id: QUOTE1_ID,
        quoteNumber: "BG-2026-0001",
        userId: DEALER1_APPROVER_ID,
        customerName: "Nguyễn Văn Hùng",
        customerPhone: "0912345678",
        customerEmail: "hung.nguyen@nhatnangpartner.vn",
        companyName: "Công ty Cổ phần Cơ điện Miền Nam",
        taxId: "0314567890",
        shippingAddress:
          "302/105 Phan Huy Ích, Phường 12, Quận Gò Vấp, TP. Hồ Chí Minh",
        status: "NEGOTIATING" as const,
        subtotalPrice: "245000000.00",
        vatRate: 10,
        vatAmount: "24500000.00",
        totalQuotedPrice: "269500000.00",
        note: "Dự án cấp nguồn dự phòng cho nhà xưởng may",
      },
    ];

    await db.insert(quotes).values(quoteData).onConflictDoNothing();

    const quoteItemData = [
      {
        quoteId: QUOTE1_ID,
        productId: PRODUCT1_ID,
        isCustomItem: false,
        quantity: 1,
        unitPrice: "245000000.00",
        discountPercent: "10.00",
        finalUnitPrice: "220500000.00",
        totalPrice: "220500000.00",
      },
    ];

    await db.insert(quoteItems).values(quoteItemData).onConflictDoNothing();
    result.quoteItemsCount = quoteItemData.length;

    const quoteMessageData = [
      {
        quoteId: QUOTE1_ID,
        senderId: DEALER1_APPROVER_ID,
        message:
          "Chào admin, bên mình cần báo giá kèm chi phí lắp đặt tủ ATS tại xưởng.",
      },
    ];

    await db
      .insert(quoteMessages)
      .values(quoteMessageData)
      .onConflictDoNothing();

    result.quotes = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        status: quotes.status,
      })
      .from(quotes);
  }

  // 2. Seed Orders
  if (isScopeActive(scopes, "operational", "orders")) {
    const orderData = [
      {
        id: ORDER1_ID,
        orderNumber: "ORD-2026-0001",
        userId: DEALER1_APPROVER_ID,
        status: "PROCESSING" as const,
        shippingFee: "2000000.00",
        shippingAddress: "Cụm Công nghiệp Ngọc Hồi, Thanh Trì, Hà Nội",
        totalAmount: "222500000.00",
        paymentMethod: "TRADE_CREDIT" as const,
        paymentStatus: "PENDING" as const,
        approvalStatus: "APPROVED" as const,
        approvedBy: DEALER1_APPROVER_ID,
      },
      {
        id: ORDER2_ID,
        orderNumber: "ORD-2026-0002",
        userId: CUSTOMER_USER_ID,
        status: "PENDING" as const,
        shippingFee: "250000.00",
        shippingAddress: "123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
        totalAmount: "12750000.00",
        paymentMethod: "PAYOS" as const,
        paymentStatus: "PENDING" as const,
        approvalStatus: "APPROVED" as const,
      },
    ];

    await db.insert(orders).values(orderData).onConflictDoNothing();

    const orderItemData = [
      {
        orderId: ORDER1_ID,
        productId: PRODUCT1_ID,
        productName: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha",
        productSku: "DHY65KSE",
        quantity: 1,
        unitPrice: "220500000.00",
      },
      {
        orderId: ORDER2_ID,
        productId: PRODUCT3_ID,
        productName: "Máy phát điện Xăng Hyundai HY3100LE 2.8kW",
        productSku: "HY3100LE",
        quantity: 1,
        unitPrice: "12500000.00",
      },
    ];

    await db.insert(orderItems).values(orderItemData).onConflictDoNothing();
    result.orderItemsCount = orderItemData.length;

    const bidData = [
      {
        orderId: ORDER1_ID,
        vendorName: "Vận tải Đa phương thức Miền Bắc",
        quotedPrice: "2000000.00",
        internalNote: "Giao bằng xe cẩu 5 tấn trong 24h",
        isSelected: true,
      },
    ];

    await db.insert(shippingBids).values(bidData).onConflictDoNothing();

    const paymentData = [
      {
        orderId: ORDER1_ID,
        amount: "222500000.00",
        method: "TRADE_CREDIT" as const,
        status: "COMPLETED" as const,
        rawPayload: JSON.stringify({ note: "Ghi nhận công nợ đại lý Gold" }),
      },
    ];

    await db.insert(payments).values(paymentData).onConflictDoNothing();

    result.orders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
      })
      .from(orders);
  }

  return result;
}
