import type {
  TNewProduct,
  TUser,
  TOrder,
  TPayment,
  TNewShippingBid,
  TNewQuote,
  TNewQuoteItem,
  TQuoteItem,
  TNewQuoteMessage,
  TQuoteMessage,
  TQuote,
  TNewDealerTier,
  TDealerTier,
  TNewPaymentTransaction,
  PaymentTransactionType,
  TWarehouseStock,
  PaymentMethod,
  PaymentTransactionStatus,
  ApprovalStatus,
} from "../schemas";
import type {
  CartItemDTO,
  CreateOrderDTO,
  CreateOrderItemDTO,
  CreatePaymentDTO,
  BrandDTO,
  CategoryDTO,
  WarehouseDTO,
  ProductDTO,
  AddressDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  UserProfileDTO,
  UserB2BProfileDTO,
  DebtRepaymentDTO,
  CreateDebtRepaymentDTO,
  UpdateDebtRepaymentDTO,
  PaymentTransactionDetailsDTO,
} from "../dtos";
import type {
  TCreateBrandInput,
  TUpdateBrandInput,
  TCreateCategoryInput,
  TUpdateCategoryInput,
  TCreateWarehouse,
  TUpdateWarehouse,
  TUpdateWarehouseStockInput,
} from "../validators";
import type { ComplexOrder } from "./order/order.service";
import type { ComplexQuote, QuoteListItem } from "./quotes/quotes.service";

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

export interface TopSellingProduct {
  id: string;
  nameVi: string;
  nameEn: string | null;
  sold: number;
  price: string;
  image: string | null;
}

// --- Auth Service Interfaces ---
export interface LoginOptions {
  headers?: HeadersInit;
  callbackURL?: string;
}

export interface RegisterOptions {
  callbackURL?: string;
}

export interface AuthService<TLoginForm = unknown, TRegisterForm = unknown> {
  loginEmail(
    data: TLoginForm,
    options?: LoginOptions,
  ): Promise<{ userId: string }>;
  register(
    data: TRegisterForm,
    options?: RegisterOptions,
  ): Promise<{ userId: string }>;
}

// --- Brand Service Interfaces ---
export interface BrandService {
  getAll(): Promise<BrandDTO[]>;
  getById(id: string): Promise<BrandDTO>;
  create(input: TCreateBrandInput): Promise<BrandDTO>;
  update(input: TUpdateBrandInput): Promise<BrandDTO>;
  delete(id: string): Promise<boolean>;
}

// --- Category Service Interfaces ---
export type TCategoryWithChildren = CategoryDTO & {
  children?: TCategoryWithChildren[];
};

export interface CategoryService {
  getAll(): Promise<CategoryDTO[]>;
  getById(id: string): Promise<CategoryDTO>;
  create(input: TCreateCategoryInput): Promise<CategoryDTO>;
  update(input: TUpdateCategoryInput): Promise<CategoryDTO>;
  delete(id: string): Promise<boolean>;
  getCategoryTree(): Promise<TCategoryWithChildren[]>;
  getCategoryDescendants(parentId: string): Promise<string[]>;
}

// --- Product Service Interfaces ---
export type TUpdateProductData = Partial<{
  [K in keyof TNewProduct]: TNewProduct[K] | undefined;
}>;

export interface GetAllOptions {
  after?: string | undefined;
  before?: string | undefined;
  categoryId?: string | undefined;
  categoryIds?: string[] | undefined;
  brandId?: string | undefined;
  brandIds?: string[] | undefined;
  status?: "active" | "outOfStock" | undefined;
  search?: string | undefined;
  fuelType?: string | undefined;
  phase?: string | undefined;
  voltage?: number | undefined;
  minPower?: number | undefined;
  maxPower?: number | undefined;
  engineBrand?: string | undefined;
  alternatorBrand?: string | undefined;
  isQuoteOnly?: boolean | undefined;
  sort?: "priceAsc" | "priceDesc" | "newest" | undefined;
}

export interface ProductFilterSpecs {
  power?: number | null;
  voltage?: number | null;
  phase?: "1phase" | "3phase" | null;
  fuelType?: "diesel" | "gasoline" | "gas" | null;
  engineBrand?: string | null;
  model?: string | null;
  alternatorBrand?: string | null;
}

export interface ProductFilterMetadata {
  id: string;
  nameVi: string;
  nameEn: string | null;
  categoryId: string | null;
  brandId: string | null;
  specs: ProductFilterSpecs | null;
}

export interface LocalItem {
  productId: string;
  quantity: number;
}

export interface ProductService {
  create(data: TNewProduct): Promise<ProductDTO>;
  update(id: string, data: TUpdateProductData): Promise<ProductDTO>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<ProductDTO>;
  getAll(
    limit?: number,
    options?: GetAllOptions,
  ): Promise<{
    data: ProductDTO[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  }>;
  getTopSellingProducts(limit: number): Promise<TopSellingProduct[]>;
  getFiltersMetadata(): Promise<ProductFilterMetadata[]>;
  getAllActiveSlugs(): Promise<string[]>;
  getActiveProductBySlug(slug: string): Promise<ProductDTO | null>;
}

// --- Warehouse Service Interfaces ---
export interface WarehouseService {
  getAll(): Promise<WarehouseDTO[]>;
  getById(id: string): Promise<WarehouseDTO>;
  create(data: TCreateWarehouse): Promise<WarehouseDTO>;
  update(data: TUpdateWarehouse): Promise<WarehouseDTO>;
  delete(id: string): Promise<boolean>;
}

// --- Warehouse Stock Service Interfaces ---
export interface WarehouseStockService {
  setStock(stockData: TUpdateWarehouseStockInput): Promise<TWarehouseStock>;
  syncTotalStock(productId: string): Promise<void>;
  getByProductId(productId: string): Promise<TWarehouseStock[]>;
}

// --- User Service Interfaces ---
export interface UserService {
  getById(id: string): Promise<UserProfileDTO | undefined>;
  findByPhone(phone: string): Promise<{ id: string } | undefined>;
  findByEmail(email: string): Promise<{ id: string } | undefined>;
  checkDuplicateUser(
    email: string,
    phone: string,
  ): Promise<{ email: string; phone: string | null } | undefined>;
  update(id: string, data: Partial<TUser>): Promise<{ id: string } | undefined>;
  list(filters?: {
    role?: TUser["role"];
    businessType?: TUser["businessType"];
  }): Promise<TUser[]>;
  getNewUsersCount(days: number): Promise<number>;
  getB2BProfile(id: string): Promise<UserB2BProfileDTO | undefined>;
}

// --- Order Service Interfaces ---
export interface OrderService {
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
  getComplexOrder(orderId: string): Promise<ComplexOrder | undefined>;
  getOrderStatus(
    orderId: string,
  ): Promise<
    | {
        id: string;
        userId: string;
        status: TOrder["status"];
        paymentStatus: TOrder["paymentStatus"];
      }
    | undefined
  >;
  createShippingBid(data: TNewShippingBid): Promise<{ id: string } | undefined>;
  selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<{
    updatedOrder: { id: string; shippingFee: string | null };
    selectedBid: { id: string };
  }>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]>;
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
}

export interface PaymentService {
  verifyCashPayment(
    orderId: string,
    verifiedById: string,
  ): Promise<{ id: string } | undefined>;
  createPayment(data: CreatePaymentDTO): Promise<{ id: string }>;
  createPaymentTransaction(
    data: TNewPaymentTransaction,
  ): Promise<{ id: string }>;
  getPaymentTransactionByReferenceCode(
    referenceCode: string,
  ): Promise<{ id: string }>;
  getPaymentTransactionByOrderCode(orderCode: number): Promise<
    | {
        id: string;
        amount: string;
        orderId: string;
        orderCode: number | null;
        status: PaymentTransactionStatus;
      }
    | undefined
  >;
  confirmDebtRepayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean>;
  updatePayment(
    id: string,
    data: Partial<TPayment>,
  ): Promise<{ id: string } | undefined>;
  getPendingPayOSTransactionByOrderId(
    orderId: string,
  ): Promise<PaymentTransactionDetailsDTO | undefined>;
  getLastPayOSTransactionByOrderId(
    orderId: string,
  ): Promise<PaymentTransactionDetailsDTO | undefined>;
  updatePaymentTransactionStatus(
    id: string,
    status: PaymentTransactionStatus,
  ): Promise<void>;
  confirmPayOSPayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean>;
  createDebtRepayment(data: CreateDebtRepaymentDTO): Promise<{ id: string }>;
  getDebtRepaymentByReferenceCode(
    referenceCode: string,
  ): Promise<DebtRepaymentDTO | undefined>;
  getDebtRepaymentByOrderCode(
    orderCode: number,
  ): Promise<DebtRepaymentDTO | undefined>;
  updateDebtRepayment(
    id: string,
    data: UpdateDebtRepaymentDTO,
  ): Promise<DebtRepaymentDTO>;
  getDebtRepaymentsByUserId(userId: string): Promise<DebtRepaymentDTO[]>;
}

// --- Quotes Service Interfaces ---
export interface QuotesService {
  createQuote(
    data: TNewQuote,
    items: Omit<TNewQuoteItem, "quoteId">[],
  ): Promise<TQuote>;
  getComplexQuote(quoteId: string): Promise<ComplexQuote | undefined>;
  listQuotes(filters?: {
    userId?: string;
    status?: TQuote["status"];
  }): Promise<QuoteListItem[]>;
  updateQuoteStatus(
    id: string,
    status: TQuote["status"],
  ): Promise<TQuote | undefined>;
  addQuoteMessage(data: TNewQuoteMessage): Promise<TQuoteMessage | undefined>;
  updateQuoteItemPrice(
    itemId: string,
    agreedPrice: string,
  ): Promise<TQuoteItem | undefined>;
  approveAndConvertToOrder(
    quoteId: string,
    adminUserId: string,
  ): Promise<{ orderId: string }>;
}

// --- Dealer Tier Service Interfaces ---
export interface DealerTierService {
  create(data: TNewDealerTier): Promise<TDealerTier>;
  update(
    id: string,
    data: Partial<TNewDealerTier>,
  ): Promise<TDealerTier | undefined>;
  getAll(): Promise<TDealerTier[]>;
  getById(id: string): Promise<TDealerTier | undefined>;
  delete(id: string): Promise<boolean>;
}

// --- Cart Service Interfaces ---
export interface CartService {
  getOrCreateCart(userId: string): Promise<{ id: string }>;
  getCartById(cartId: string): Promise<{ id: string } | undefined>;
  getCartItems(cartId: string): Promise<CartItemDTO[]>;
  addToCart(cartId: string, productId: string, quantity: number): Promise<void>;
  updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
  removeFromCart(cartId: string, productId: string): Promise<void>;
  mergeLocalItems(userId: string, localItems: LocalItem[]): Promise<void>;
}

// --- Address Service Interfaces ---
export interface AddressService {
  getByUserId(userId: string): Promise<AddressDTO[]>;
  create(address: CreateAddressDTO): Promise<{ id: string }>;
  update(
    id: string,
    userId: string,
    address: UpdateAddressDTO,
  ): Promise<{ id: string }>;
  delete(id: string, userId: string): Promise<boolean>;
  setDefault(id: string, userId: string): Promise<void>;
}
