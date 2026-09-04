import type {
  AdminProduct,
  AdminCategory,
  AdminBrand,
  AdminWarehouse,
  AdminWarehouseStock,
  AdminOrder,
  AdminOrderItem,
  AdminQuote,
  AdminQuoteItem,
  AdminQuoteMessage,
  AdminUser,
  AdminDealerTier,
  ShippingBid,
} from "@/lib/api-client";
import type { UserRole } from "@/shared/lib/action-auth";

export type ProductDTO = AdminProduct;
export type CategoryDTO = AdminCategory;
export type BrandDTO = AdminBrand;
export type WarehouseDTO = AdminWarehouse & {
  name?: string;
  ward?: string;
  location?: string;
};
export type WarehouseStockDTO = AdminWarehouseStock & {
  warehouse?: WarehouseDTO;
  product?: ProductDTO;
  stock?: number;
  minStockWarning?: number | null;
};
export interface CommercialTerms {
  validityDays?: number;
  deliveryTime?: string;
  deliveryLocation?: string;
  paymentSchedule?: string;
  warrantyTerms?: string;
}
export type Order = AdminOrder & {
  user?: AdminUser | null;
};
export type Quote = AdminQuote & {
  user?: AdminUser | null;
  commercialTerms?: CommercialTerms | null;
  totalQuotedPrice?: string | null;
  expirationDate?: string | null;
};
export type User = AdminUser & {
  dealerTierId?: string | null;
};
export type DealerTierDTO = AdminDealerTier & {
  nameVi?: string;
  nameEn?: string | null;
  minimumSpend?: string;
  discountPercentage?: string | number;
};
export type DealerTier = DealerTierDTO;
export type ComplexOrder = Order;
export type ComplexQuote = Quote;
export type QuoteListItem = Quote;
export type QuoteItem = AdminQuoteItem & {
  isCustomItem?: boolean;
};
export type OrderItem = AdminOrderItem;
export type QuoteMessage = AdminQuoteMessage;

export type { ShippingBid, UserRole };
export type BusinessType = "DEALER" | "CONTRACTOR" | "END_USER" | "DISTRIBUTOR";

export interface SelectWinningBidResult {
  orderId: string;
  shippingFee: string;
  winningBid: ShippingBid;
}

export interface DashboardMetrics {
  totalRevenue: number | string;
  totalOrders: number;
  totalProducts: number;
  newCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth?: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface TopSellingProduct {
  id: string;
  name?: string;
  nameVi?: string;
  nameEn?: string | null;
  salesCount?: number;
  sold?: number;
  revenue?: string;
  price?: string;
  image?: string;
}

export const orderStatusEnum = {
  enumValues: [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "SUSPICIOUS_PAYMENT_HOLD",
  ],
} as const;

export const quoteStatusEnum = {
  enumValues: [
    "DRAFT",
    "SUBMITTED",
    "NEGOTIATING",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
  ],
} as const;
