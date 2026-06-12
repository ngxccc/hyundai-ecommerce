import { db } from "../client";
import { AuthService } from "./auth/auth.service";
import { ProductService } from "./product/product.service";
import { UserService } from "./user/user.service";
import { OrderService } from "./order/order.service";
import { CategoryService } from "./category/category.service";
import { BrandService } from "./brand/brand.service";
import { WarehouseStockService } from "./warehouse-stock/warehouse-stock.service";
import { WarehouseService } from "./warehouse/warehouse.service";
import { QuotesService } from "./quotes/quotes.service";
import { DealerTierService } from "./dealer-tier/dealer-tier.service";

export const authService = new AuthService(db);
export const productService = new ProductService(db);
export const userService = new UserService(db);
export const orderService = new OrderService(db);
export const categoryService = new CategoryService(db);
export const brandService = new BrandService(db);
export const warehouseStockService = new WarehouseStockService(db);
export const warehouseService = new WarehouseService(db);
export const quotesService = new QuotesService(db);
export const dealerTierService = new DealerTierService(db);


