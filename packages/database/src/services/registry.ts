import { db } from "../client";
import { DbAuthService } from "./auth/auth.service";
import { DbProductService } from "./product/product.service";
import { DbUserService } from "./user/user.service";
import { DbOrderService } from "./order/order.service";
import { DbCategoryService } from "./category/category.service";
import { DbBrandService } from "./brand/brand.service";
import { DbWarehouseStockService } from "./warehouse-stock/warehouse-stock.service";
import { DbWarehouseService } from "./warehouse/warehouse.service";
import { DbQuotesService } from "./quotes/quotes.service";
import { DbDealerTierService } from "./dealer-tier/dealer-tier.service";
import { DbCartService } from "./cart/cart.service";
import { DbAddressService } from "./address/address.service";
import type {
  AuthService,
  ProductService,
  UserService,
  OrderService,
  CategoryService,
  BrandService,
  WarehouseStockService,
  WarehouseService,
  QuotesService,
  DealerTierService,
  CartService,
  AddressService,
} from "./interfaces";

export const authService: AuthService = new DbAuthService(db);
export const productService: ProductService = new DbProductService(db);
export const userService: UserService = new DbUserService(db);
export const orderService: OrderService = new DbOrderService(db);
export const categoryService: CategoryService = new DbCategoryService(db);
export const brandService: BrandService = new DbBrandService(db);
export const warehouseStockService: WarehouseStockService =
  new DbWarehouseStockService(db);
export const warehouseService: WarehouseService = new DbWarehouseService(db);
export const quotesService: QuotesService = new DbQuotesService(db);
export const dealerTierService: DealerTierService = new DbDealerTierService(db);
export const cartService: CartService = new DbCartService(db);
export const addressService: AddressService = new DbAddressService(db);
