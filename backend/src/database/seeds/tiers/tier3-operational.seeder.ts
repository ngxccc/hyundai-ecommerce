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
import type {
  Tier2SeedResult,
  Tier3SeedResult,
  QuoteFixtureData,
  OrderFixtureData,
} from "../types/seed.type";
import quotesFixture from "../fixtures/operational/quotes.json";
import ordersFixture from "../fixtures/operational/orders.json";

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

  // 1. Seed Quotes & Items
  if (isScopeActive(scopes, "operational", "quotes")) {
    const quotesList = quotesFixture as unknown as QuoteFixtureData[];
    const quoteTableData = quotesList.map(
      ({ items: _items, messages: _msgs, ...quote }) => {
        const validityDays = quote.commercialTerms?.validityDays ?? 15;
        const expirationDate = quote.expirationDate
          ? new Date(quote.expirationDate)
          : new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        return {
          ...quote,
          commercialTerms: quote.commercialTerms ?? {
            validityDays: 15,
            paymentSchedule:
              "Tạm ứng 30% khi ký hợp đồng, 70% còn lại trước khi bàn giao.",
            deliveryTime:
              "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng.",
            deliveryLocation:
              "Giao hàng và hướng dẫn vận hành tại chân công trình Bên Mua.",
            warrantyTerms:
              "Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy theo tiêu chuẩn Hyundai.",
          },
          expirationDate,
        };
      },
    );
    await db.insert(quotes).values(quoteTableData).onConflictDoNothing();

    const quoteItemData = quotesList.flatMap((q) =>
      q.items.map((item) => ({
        quoteId: q.id,
        productId: item.productId ?? null,
        isCustomItem: item.isCustomItem,
        itemName: item.itemName,
        itemModel: item.itemModel ?? null,
        itemSpecs: item.itemSpecs ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        finalUnitPrice: item.finalUnitPrice,
        totalPrice: item.totalPrice,
      })),
    );
    if (quoteItemData.length > 0) {
      await db.insert(quoteItems).values(quoteItemData).onConflictDoNothing();
      result.quoteItemsCount = quoteItemData.length;
    }

    const quoteMessageData = quotesList.flatMap((q) =>
      q.messages.map((msg) => ({
        quoteId: q.id,
        senderId: msg.senderId,
        message: msg.message,
      })),
    );
    if (quoteMessageData.length > 0) {
      await db
        .insert(quoteMessages)
        .values(quoteMessageData)
        .onConflictDoNothing();
    }

    result.quotes = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        status: quotes.status,
      })
      .from(quotes);
  }

  // 2. Seed Orders & Items & Shipping Bids & Payments
  if (isScopeActive(scopes, "operational", "orders")) {
    const ordersList = ordersFixture as unknown as OrderFixtureData[];
    const orderTableData = ordersList.map(
      ({ items: _items, shippingBids: _bids, payments: _pmts, ...order }) =>
        order,
    );
    await db.insert(orders).values(orderTableData).onConflictDoNothing();

    const orderItemData = ordersList.flatMap((o) =>
      o.items.map((item) => ({
        orderId: o.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );
    if (orderItemData.length > 0) {
      await db.insert(orderItems).values(orderItemData).onConflictDoNothing();
      result.orderItemsCount = orderItemData.length;
    }

    const shippingBidData = ordersList.flatMap((o) =>
      o.shippingBids.map((bid) => ({
        orderId: o.id,
        vendorName: bid.vendorName,
        quotedPrice: bid.quotedPrice,
        internalNote: bid.internalNote,
        isSelected: bid.isSelected,
      })),
    );
    if (shippingBidData.length > 0) {
      await db
        .insert(shippingBids)
        .values(shippingBidData)
        .onConflictDoNothing();
    }

    const paymentData = ordersList.flatMap((o) =>
      o.payments.map((pmt) => ({
        orderId: o.id,
        amount: pmt.amount,
        method: pmt.method,
        status: pmt.status,
        rawPayload: pmt.rawPayload,
      })),
    );
    if (paymentData.length > 0) {
      await db.insert(payments).values(paymentData).onConflictDoNothing();
    }

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
