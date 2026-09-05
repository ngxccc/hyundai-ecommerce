import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import {
  ApiOkResponseGeneric,
  ApiOkResponsePaginated,
  ApiCreatedResponseGeneric,
  ApiNotFoundResponseRfc9457,
  ApiBadRequestResponseRfc9457,
  ApiConflictResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { type PaginationMetaDto } from "@/common/dto/pagination-meta.dto";
import { CATALOG_ROUTES } from "./catalog.routes";
import { ProductsService } from "./products.service";
import { ProductQueryDto } from "./dto/product-query.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { ProductMetadataResponseDto } from "./dto/product-metadata-response.dto";

@ApiTags(CATALOG_ROUTES.PRODUCTS.TAG)
@Controller(CATALOG_ROUTES.PRODUCTS.PREFIX)
@UseGuards(CustomThrottlerGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(CATALOG_ROUTES.PRODUCTS.FIND_ALL)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "List products with hybrid faceted search and pagination",
    description:
      "Returns a paginated list of products matching filter criteria (power, price, brand, category, specs).",
  })
  @ApiOkResponsePaginated(ProductResponseDto)
  @ApiTooManyRequestsResponseRfc9457()
  async getProducts(
    @Query() query: ProductQueryDto,
  ): Promise<ApiResponse<ProductResponseDto[], PaginationMetaDto>> {
    const result = await this.productsService.findProducts(query);
    return apiSuccess(result.items, result.meta);
  }

  @Get(CATALOG_ROUTES.PRODUCTS.METADATA)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "Get faceted filter metadata",
    description:
      "Returns available filter ranges (price, power) and facet counts for brands, categories, fuel types, and phases.",
  })
  @ApiOkResponseGeneric(ProductMetadataResponseDto)
  @ApiTooManyRequestsResponseRfc9457()
  async getMetadata(): Promise<ApiResponse<ProductMetadataResponseDto>> {
    const metadata = await this.productsService.getMetadata();
    return apiSuccess(metadata);
  }

  @Get(CATALOG_ROUTES.PRODUCTS.FIND_BY_ID)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "Get product by ID or slug",
    description: "Returns full product details by UUID or URL slug.",
  })
  @ApiOkResponseGeneric(ProductResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getById(
    @Param("id") id: string,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productsService.findById(id);
    return apiSuccess(product);
  }

  @Post(CATALOG_ROUTES.PRODUCTS.CREATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create product (Admin only)",
    description:
      "Creates a new product with technical specifications and images.",
  })
  @ApiCreatedResponseGeneric(ProductResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async create(
    @Body() dto: CreateProductDto,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const created = await this.productsService.create(dto);
    return apiSuccess(created);
  }

  @Put(CATALOG_ROUTES.PRODUCTS.UPDATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update product (Admin only)",
    description: "Updates an existing product by UUID.",
  })
  @ApiOkResponseGeneric(ProductResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<ProductResponseDto>> {
    const updated = await this.productsService.update(id, dto);
    return apiSuccess(updated);
  }

  @Delete(CATALOG_ROUTES.PRODUCTS.DELETE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete product (Admin only)",
    description: "Soft deletes an existing product by UUID.",
  })
  @ApiOkResponseGeneric(Object)
  @ApiNotFoundResponseRfc9457()
  async delete(@Param("id") id: string): Promise<ApiResponse<null>> {
    await this.productsService.delete(id);
    return apiSuccess(null);
  }
}
