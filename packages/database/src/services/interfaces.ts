import type {
  TNewProduct,
  TUser,
  TOrder,
  TPayment,
  TNewShippingBid,
  TShippingBid,
  TNewQuote,
  TNewQuoteItem,
  TQuoteItem,
  TNewQuoteMessage,
  TQuoteMessage,
  TQuote,
  TNewDealerTier,
  TDealerTier,
  TWarehouseStock,
  TCart,
  TCartItem,
  TPaymentTransaction,
  TNewPaymentTransaction,
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
  getById(id: string): Promise<BrandDTO | undefined>;
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
  getById(id: string): Promise<CategoryDTO | undefined>;
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
  create(data: TNewProduct): Promise<ProductDTO | undefined>;
  update(id: string, data: TUpdateProductData): Promise<ProductDTO | undefined>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<ProductDTO | undefined>;
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
  getById(id: string): Promise<WarehouseDTO | undefined>;
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
  findByPhone(phone: string): Promise<{ id: string } | undefined>;
  findByEmail(email: string): Promise<{ id: string } | undefined>;
  checkDuplicateUser(
    email: string,
    phone: string,
  ): Promise<{ email: string; phone: string | null } | undefined>;
  update(id: string, data: Partial<TUser>): Promise<TUser | undefined>;
  list(filters?: {
    role?: TUser["role"];
    businessType?: TUser["businessType"];
  }): Promise<TUser[]>;
  getNewUsersCount(days: number): Promise<number>;
}

// --- Order Service Interfaces ---
export interface OrderService {
  list(filters?: { status?: TOrder["status"] }): Promise<ComplexOrder[]>;
  createOrder(data: CreateOrderDTO): Promise<TOrder | undefined>;
  createOrderWithItems(
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartIdToClear?: string,
  ): Promise<TOrder>;
  updateOrderStatus(
    id: string,
    status: TOrder["status"],
  ): Promise<TOrder | undefined>;
  getComplexOrder(orderId: string): Promise<ComplexOrder | undefined>;
  createShippingBid(data: TNewShippingBid): Promise<TShippingBid | undefined>;
  selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<{ updatedOrder: TOrder; selectedBid: TShippingBid }>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]>;
  approveDealerOrder(orderId: string): Promise<TOrder | undefined>;
  verifyCashPayment(
    orderId: string,
    verifiedById: string,
  ): Promise<TOrder | undefined>;
  approveOrderCancellation(orderId: string): Promise<TOrder | undefined>;
  createPayment(data: CreatePaymentDTO): Promise<TPayment>;
  createPaymentTransaction(
    data: TNewPaymentTransaction,
  ): Promise<TPaymentTransaction>;
  getPaymentTransactionByReferenceCode(
    referenceCode: string,
  ): Promise<TPaymentTransaction>;
  updatePayment(
    id: string,
    data: Partial<TPayment>,
  ): Promise<TPayment | undefined>;
  confirmPayOSPayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean>;
  checkoutWithTradeCredit(
    userId: string,
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartId: string,
  ): Promise<TOrder>;
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
  getOrCreateCart(userId: string): Promise<TCart>;
  getCartById(cartId: string): Promise<TCart | null>;
  getCartItems(cartId: string): Promise<CartItemDTO[]>;
  addToCart(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<TCartItem>;
  updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<TCartItem | null>;
  removeFromCart(cartId: string, productId: string): Promise<void>;
  mergeLocalItems(userId: string, localItems: LocalItem[]): Promise<TCart>;
}
