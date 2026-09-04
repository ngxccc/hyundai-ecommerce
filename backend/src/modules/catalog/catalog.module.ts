import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { BrandsController } from "./brands.controller";
import { BrandsService } from "./brands.service";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  controllers: [CategoriesController, BrandsController, ProductsController],
  providers: [CategoriesService, BrandsService, ProductsService],
  exports: [CategoriesService, BrandsService, ProductsService],
})
export class CatalogModule {}
