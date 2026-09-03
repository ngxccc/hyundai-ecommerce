import { defineRelations } from "drizzle-orm";
import { users, refreshTokens } from "./auth.schema";
import { dealerTiers } from "./dealer-tier.schema";
import { creditLimitHistory } from "./credit-limit-history.schema";
import { userAddresses } from "./user-address.schema";
import { brands } from "./brand.schema";
import { categories } from "./category.schema";
import { products } from "./product.schema";
import { warehouses, warehouseStocks } from "./warehouse.schema";
import { carts, cartItems } from "./cart.schema";
import { orders, orderItems, shippingBids } from "./order.schema";
import { quotes, quoteItems, quoteMessages } from "./quotes.schema";
import {
  debtRepayments,
  payments,
  paymentTransactions,
} from "./payments.schema";

export const schemaRelations = defineRelations(
  {
    users,
    refreshTokens,
    dealerTiers,
    creditLimitHistory,
    userAddresses,
    brands,
    categories,
    products,
    warehouses,
    warehouseStocks,
    carts,
    cartItems,
    orders,
    orderItems,
    shippingBids,
    quotes,
    quoteItems,
    quoteMessages,
    payments,
    debtRepayments,
    paymentTransactions,
  },
  (r) => ({
    users: {
      tier: r.one.dealerTiers({
        from: r.users.dealerTierId,
        to: r.dealerTiers.id,
      }),
      employees: r.many.users({
        from: r.users.id,
        to: r.users.parentId,
        alias: "employees",
      }),
      parent: r.one.users({
        from: r.users.parentId,
        to: r.users.id,
        alias: "parent",
      }),
      refreshTokens: r.many.refreshTokens(),
      cart: r.one.carts({
        from: r.users.id,
        to: r.carts.userId,
      }),
      orders: r.many.orders(),
      userAddresses: r.many.userAddresses(),
      quotes: r.many.quotes(),
      quoteMessages: r.many.quoteMessages(),
      verifiedTransactions: r.many.paymentTransactions(),
      creditLimitHistory: r.many.creditLimitHistory({
        alias: "userCreditLimitHistory",
      }),
      changedCreditLimits: r.many.creditLimitHistory({
        alias: "changedByCreditLimitHistory",
      }),
      debtRepayments: r.many.debtRepayments({
        alias: "userDebtRepayment",
      }),
      verifiedRepayments: r.many.debtRepayments({
        alias: "verifiedByDebtRepayment",
      }),
    },

    refreshTokens: {
      user: r.one.users({
        from: r.refreshTokens.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    dealerTiers: {
      users: r.many.users(),
    },

    userAddresses: {
      user: r.one.users({
        from: r.userAddresses.userId,
        to: r.users.id,
        optional: false,
      }),
    },

    brands: {
      products: r.many.products(),
    },

    categories: {
      children: r.many.categories({
        from: r.categories.id,
        to: r.categories.parentId,
      }),
      parent: r.one.categories({
        from: r.categories.parentId,
        to: r.categories.id,
      }),
      products: r.many.products(),
    },

    products: {
      brand: r.one.brands({
        from: r.products.brandId,
        to: r.brands.id,
      }),
      category: r.one.categories({
        from: r.products.categoryId,
        to: r.categories.id,
      }),
      stocks: r.many.warehouseStocks(),
      quoteItems: r.many.quoteItems(),
      orderItems: r.many.orderItems(),
      cartItems: r.many.cartItems(),
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

    carts: {
      user: r.one.users({
        from: r.carts.userId,
        to: r.users.id,
      }),
      items: r.many.cartItems(),
    },

    cartItems: {
      cart: r.one.carts({
        from: r.cartItems.cartId,
        to: r.carts.id,
        optional: false,
      }),
      product: r.one.products({
        from: r.cartItems.productId,
        to: r.products.id,
        optional: false,
      }),
    },

    orders: {
      user: r.one.users({
        from: r.orders.userId,
        to: r.users.id,
        optional: false,
      }),
      payment: r.one.payments({
        from: r.orders.id,
        to: r.payments.orderId,
      }),
      items: r.many.orderItems(),
      bids: r.many.shippingBids(),
      paymentTransactions: r.many.paymentTransactions(),
      quote: r.one.quotes({
        from: r.orders.id,
        to: r.quotes.orderId,
      }),
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

    quotes: {
      user: r.one.users({
        from: r.quotes.userId,
        to: r.users.id,
      }),
      items: r.many.quoteItems(),
      messages: r.many.quoteMessages(),
      order: r.one.orders({
        from: r.quotes.orderId,
        to: r.orders.id,
      }),
    },

    quoteItems: {
      quote: r.one.quotes({
        from: r.quoteItems.quoteId,
        to: r.quotes.id,
        optional: false,
      }),
      product: r.one.products({
        from: r.quoteItems.productId,
        to: r.products.id,
      }),
    },

    quoteMessages: {
      quote: r.one.quotes({
        from: r.quoteMessages.quoteId,
        to: r.quotes.id,
        optional: false,
      }),
      sender: r.one.users({
        from: r.quoteMessages.senderId,
        to: r.users.id,
        optional: false,
      }),
    },

    payments: {
      order: r.one.orders({
        from: r.payments.orderId,
        to: r.orders.id,
        optional: false,
      }),
    },

    paymentTransactions: {
      order: r.one.orders({
        from: r.paymentTransactions.orderId,
        to: r.orders.id,
        optional: false,
      }),
      verifiedByUser: r.one.users({
        from: r.paymentTransactions.verifiedBy,
        to: r.users.id,
      }),
    },

    creditLimitHistory: {
      user: r.one.users({
        from: r.creditLimitHistory.userId,
        to: r.users.id,
        alias: "userCreditLimitHistory",
      }),
      changedByUser: r.one.users({
        from: r.creditLimitHistory.changedBy,
        to: r.users.id,
        alias: "changedByCreditLimitHistory",
      }),
    },

    debtRepayments: {
      user: r.one.users({
        from: r.debtRepayments.userId,
        to: r.users.id,
        alias: "userDebtRepayment",
        optional: false,
      }),
      verifiedByUser: r.one.users({
        from: r.debtRepayments.verifiedBy,
        to: r.users.id,
        alias: "verifiedByDebtRepayment",
      }),
    },
  }),
);
