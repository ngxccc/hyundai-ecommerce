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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
} from "@/common/decorators";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { apiSuccess } from "@/common/utils/api-response.util";
import { WAREHOUSE_ROUTES } from "./warehouse.routes";
import { WarehouseService } from "./warehouse.service";
import {
  CreateWarehouseDto,
  UpdateStockDto,
  UpdateWarehouseDto,
  WarehouseResponseDto,
  WarehouseStockResponseDto,
} from "./dto";

@ApiTags(WAREHOUSE_ROUTES.TAG)
@Controller(WAREHOUSE_ROUTES.ROOT)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: "List all physical warehouses" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    type: Boolean,
    description: "Whether to include deactivated warehouses",
  })
  @ApiOkResponseGeneric(WarehouseResponseDto, { isArray: true })
  async getAll(@Query("includeInactive") includeInactive?: string) {
    const shouldInclude = includeInactive === "true";
    const data = await this.warehouseService.findAll(shouldInclude);
    return apiSuccess(data);
  }

  @Get(WAREHOUSE_ROUTES.PRODUCT_STOCK)
  @ApiOperation({
    summary: "Get stock distribution across all warehouses for a product",
  })
  @ApiParam({ name: "productId", description: "Product UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto, { isArray: true })
  async getProductStocks(@Param("productId") productId: string) {
    const data = await this.warehouseService.getProductStocks(productId);
    return apiSuccess(data);
  }

  @Get(WAREHOUSE_ROUTES.STOCK)
  @ApiOperation({
    summary: "Get all product inventory stocks located in a warehouse",
  })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto, { isArray: true })
  async getWarehouseStocks(@Param("id") id: string) {
    const data = await this.warehouseService.getWarehouseStocks(id);
    return apiSuccess(data);
  }

  @Get(WAREHOUSE_ROUTES.BY_ID)
  @ApiOperation({ summary: "Get warehouse details by UUID" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseResponseDto)
  async getById(@Param("id") id: string) {
    const data = await this.warehouseService.findById(id);
    return apiSuccess(data);
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a new physical warehouse (Admin Only)" })
  @ApiCreatedResponseGeneric(WarehouseResponseDto)
  async create(@Body() dto: CreateWarehouseDto) {
    const data = await this.warehouseService.create(dto);
    return apiSuccess(data);
  }

  @Put(WAREHOUSE_ROUTES.STOCK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary:
      "Update product stock in a warehouse and atomically sync totalStockCache (Admin Only)",
  })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto)
  async updateStock(@Param("id") id: string, @Body() dto: UpdateStockDto) {
    const data = await this.warehouseService.updateStock(id, dto);
    return apiSuccess(data);
  }

  @Put(WAREHOUSE_ROUTES.BY_ID)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update warehouse details (Admin Only)" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseResponseDto)
  async update(@Param("id") id: string, @Body() dto: UpdateWarehouseDto) {
    const data = await this.warehouseService.update(id, dto);
    return apiSuccess(data);
  }

  @Delete(WAREHOUSE_ROUTES.BY_ID)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Deactivate warehouse (Admin Only)" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric()
  async delete(@Param("id") id: string) {
    await this.warehouseService.delete(id);
    return apiSuccess(null);
  }
}
