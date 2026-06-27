import type {
  TOrder,
  TNewShippingBid,
  PaymentTransactionType,
  PaymentMethod,
  ApprovalStatus,
  TOutboxEvent,
  OutboxEventStatus,
} from "../../schemas";
import type { CreateOrderDTO, CreateOrderItemDTO } from "../../dtos";

export interface ComplexOrder {
  id: string;
  userId: string;
  status: TOrder["status"];
  paymentStatus: TOrder["paymentStatus"];
  paymentMethod: TOrder["paymentMethod"];
  shippingFee: string | null;
  shippingAddress: string;
  totalAmount: string;
  createdAt: Date;
  approvalStatus: ApprovalStatus;
  user: {
    id: string;
    name: string;
    email: string;
    companyName: string | null;
    taxId: string | null;
    phone: string;
    businessType: string;
    parentId: string | null;
  };
  items: {
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: string;
  }[];
  bids?: {
    id: string;
    vendorName: string;
    quotedPrice: string;
    internalNote: string | null;
    isSelected: boolean;
  }[];
  paymentTransactions?: {
    id: string;
    status: string;
    paymentMethod: string;
    transactionType: string;
    amount: string;
    referenceCode: number;
    createdAt: Date;
  }[];
}

export interface DashboardMetrics {
  totalRevenue: string;
  totalOrders: number;
  totalProducts: number;
  newCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: string;
  orderCount: number;
}

export interface OrderStatusDetails {
  id: string;
  userId: string;
  status: TOrder["status"];
  paymentStatus: TOrder["paymentStatus"];
}

export interface SelectWinningBidResult {
  updatedOrder: { id: string; shippingFee: string | null };
  selectedBid: { id: string };
}

export interface OrderQueryService {
  listOrders(filters?: { status?: TOrder["status"] }): Promise<ComplexOrder[]>;
  listUserOrders(userId: string): Promise<ComplexOrder[]>;
  listUserOrdersPaginated(
    userId: string,
    limit?: number,
    options?: {
      after?: string | undefined;
      before?: string | undefined;
      last?: boolean | undefined;
    },
  ): Promise<{
    orders: ComplexOrder[];
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  }>;
  listCompanyOrders(companyName: string): Promise<ComplexOrder[]>;
  listCompanyOrdersPaginated(
    companyName: string,
    limit?: number,
    options?: {
      after?: string | undefined;
      before?: string | undefined;
      excludeUserId?: string | undefined;
      approvalStatus?: ApprovalStatus | undefined;
      last?: boolean | undefined;
    },
  ): Promise<{
    orders: ComplexOrder[];
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  }>;
  getComplexOrder(
    orderId: string,
    userId?: string,
  ): Promise<ComplexOrder | undefined>;
  getOrderStatus(
    orderId: string,
    userId?: string,
  ): Promise<OrderStatusDetails | undefined>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]>;
}

export interface OrderService {
  createOrder(data: CreateOrderDTO): Promise<{ id: string } | undefined>;
  createOrderWithItems(
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartIdToClear?: string,
  ): Promise<{ id: string }>;
  updateOrderStatus(
    id: string,
    status: TOrder["status"],
  ): Promise<{ id: string } | undefined>;
  createShippingBid(data: TNewShippingBid): Promise<{ id: string } | undefined>;
  selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<SelectWinningBidResult>;
  approveDealerOrder(orderId: string): Promise<{ id: string } | undefined>;
  checkoutWithTradeCredit(
    userId: string,
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartId: string,
  ): Promise<{ id: string }>;
  approveOrderCancellation(
    orderId: string,
  ): Promise<{ id: string } | undefined>;
  requestOrderCancellation(
    orderId: string,
  ): Promise<{ id: string } | undefined>;
  createPendingPaymentTransaction(
    orderId: string,
    amount: number,
    transactionType: PaymentTransactionType,
    referenceCode: number,
    method?: Exclude<PaymentMethod, "TRADE_CREDIT">,
  ): Promise<void>;
  expirePendingOrders(
    expirationWindowMinutes?: number,
  ): Promise<{ expiredCount: number }>;
  fetchPendingOutboxEvents(
    limit: number,
  ): Promise<
    Pick<TOutboxEvent, "id" | "eventType" | "payload" | "retryCount">[]
  >;
  updateOutboxEventStatus(
    id: string,
    status: OutboxEventStatus,
    error?: string,
  ): Promise<void>;
}
