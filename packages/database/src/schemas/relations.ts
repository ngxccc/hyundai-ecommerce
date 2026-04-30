import { defineRelations } from "drizzle-orm";
import { orders } from "./order.schema";
import { orderItems } from "./order-item.schema";
import { accounts, sessions, users } from "./auth.schema";
import { dealerTiers } from "./dealer-tier.schema";
import { shippingBids } from "./shipping-bid.schema";
import { products } from "./product.schema";
import { warehouses } from "./warehouse.schema";
import { warehouseStocks } from "./warehouse-stock.schema";

export const schemaRelations = defineRelations(
  {
    users,
    accounts,
    sessions,
    dealerTiers,
    orders,
    orderItems,
    shippingBids,
    products,
    warehouses,
    warehouseStocks,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      orders: r.many.orders(),
      tier: r.one.dealerTiers({
        from: r.users.dealerTierId,
        to: r.dealerTiers.id,
      }),
    },

    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    dealerTiers: {
      users: r.many.users(),
    },

    orders: {
      user: r.one.users({
        from: r.orders.userId,
        to: r.users.id,
        optional: false,
      }),
      items: r.many.orderItems(),
      bids: r.many.shippingBids(),
    },

    orderItems: {
      order: r.one.orders({
        from: r.orderItems.orderId,
        to: r.orders.id,
        optional: false,
      }),
      product: r.one.products({
        from: r.orderItems.productId,
        to: r.products.id,
        optional: false,
      }),
    },

    shippingBids: {
      order: r.one.orders({
        from: r.shippingBids.orderId,
        to: r.orders.id,
        optional: false,
      }),
    },

    products: {
      stocks: r.many.warehouseStocks(),
    },

    warehouses: {
      stocks: r.many.warehouseStocks(),
    },

    warehouseStocks: {
      warehouse: r.one.warehouses({
        from: r.warehouseStocks.warehouseId,
        to: r.warehouses.id,
        optional: false,
      }),
      product: r.one.products({
        from: r.warehouseStocks.productId,
        to: r.products.id,
        optional: false,
      }),
    },
  }),
);
