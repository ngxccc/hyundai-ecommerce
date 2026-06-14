import type {
  TBrand,
  TCategory,
  TNewProduct,
  TProduct,
  TUser,
  TNewOrder,
  TOrder,
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
  TWarehouse,
  TWarehouseStock,
  TCart,
  TCartItem,
} from "../schemas";
import type { CartItemDTO } from "../dtos";

import type {
  TCreateBrandInput,
  TUpdateBrandInput,
  TCreateCategoryInput,
  TUpdateCategoryInput,
  TCreateWarehouseInput,
  TUpdateWarehouseInput,
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
  getAll(): Promise<TBrand[]>;
  getById(id: string): Promise<TBrand | undefined>;
  create(input: TCreateBrandInput): Promise<TBrand>;
  update(input: TUpdateBrandInput): Promise<TBrand>;
  delete(id: string): Promise<boolean>;
}

// --- Category Service Interfaces ---
export type TCategoryWithChildren = TCategory & {
  children?: TCategoryWithChildren[];
};

export interface CategoryService {
  getAll(): Promise<TCategory[]>;
  getById(id: string): Promise<TCategory | undefined>;
  create(input: TCreateCategoryInput): Promise<TCategory>;
  update(input: TUpdateCategoryInput): Promise<TCategory>;
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
  create(data: TNewProduct): Promise<TProduct | undefined>;
  update(id: string, data: TUpdateProductData): Promise<TProduct | undefined>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<TProduct | undefined>;
  getAll(
    limit?: number,
    options?: GetAllOptions,
  ): Promise<{
    data: TProduct[];
    hasMore: boolean;
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
  }>;
  getTopSellingProducts(limit: number): Promise<TopSellingProduct[]>;
  getFiltersMetadata(): Promise<ProductFilterMetadata[]>;
  getAllActiveSlugs(): Promise<string[]>;
  getActiveProductBySlug(slug: string): Promise<TProduct | null>;
}

// --- Warehouse Service Interfaces ---
export interface WarehouseService {
  getAll(): Promise<TWarehouse[]>;
  getById(id: string): Promise<TWarehouse | undefined>;
  create(data: TCreateWarehouseInput): Promise<TWarehouse>;
  update(data: TUpdateWarehouseInput): Promise<TWarehouse>;
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
  createOrder(data: TNewOrder): Promise<TOrder | undefined>;
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
