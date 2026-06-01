import { db } from "../client";
import { AuthService } from "./auth.service";
import { ProductService } from "./product.service";
import { UserService } from "./user.service";
import { OrderService } from "./order.service";
import { CategoryService } from "./category.service";
import { BrandService } from "./brand.service";
import { WarehouseStockService } from "./warehouse-stock.service";
import { WarehouseService } from "./warehouse.service";
import { QuotesService } from "./quotes.service";

export const authService = new AuthService(db);
export const productService = new ProductService(db);
export const userService = new UserService(db);
export const orderService = new OrderService(db);
export const categoryService = new CategoryService(db);
export const brandService = new BrandService(db);
export const warehouseStockService = new WarehouseStockService(db);
export const warehouseService = new WarehouseService(db);
export const quotesService = new QuotesService(db);

