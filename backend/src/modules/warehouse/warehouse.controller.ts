import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  ApiAuth,
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
  ApiBadRequestResponseRfc9457,
  ApiNotFoundResponseRfc9457,
  ApiConflictResponseRfc9457,
} from "@/common/decorators";
import { Throttle } from "@nestjs/throttler";
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
@Controller({ path: WAREHOUSE_ROUTES.ROOT, version: "1" })
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @ApiAuth("ADMIN", "SALES")
  @Get()
  @ApiOperation({ summary: "List all physical warehouses" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    type: Boolean,
    description: "Whether to include deactivated warehouses",
  })
  @ApiOkResponseGeneric(WarehouseResponseDto, { isArray: true })
  async getAll(
    @Query("includeInactive", new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ) {
    const data = await this.warehouseService.findAll(Boolean(includeInactive));
    return apiSuccess(data);
  }

  @ApiAuth("ADMIN", "SALES")
  @Get(WAREHOUSE_ROUTES.PRODUCT_STOCK)
  @ApiOperation({
    summary: "Get stock distribution across all warehouses for a product",
  })
  @ApiParam({ name: "productId", description: "Product UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto, { isArray: true })
  @ApiNotFoundResponseRfc9457()
  async getProductStocks(@Param("productId", ParseUUIDPipe) productId: string) {
    const data = await this.warehouseService.getProductStocks(productId);
    return apiSuccess(data);
  }

  @ApiAuth("ADMIN", "SALES")
  @Get(WAREHOUSE_ROUTES.STOCK)
  @ApiOperation({
    summary: "Get all product inventory stocks located in a warehouse",
  })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto, { isArray: true })
  @ApiNotFoundResponseRfc9457()
  async getWarehouseStocks(@Param("id", ParseUUIDPipe) id: string) {
    const data = await this.warehouseService.getWarehouseStocks(id);
    return apiSuccess(data);
  }

  @ApiAuth("ADMIN", "SALES")
  @Get(WAREHOUSE_ROUTES.BY_ID)
  @ApiOperation({ summary: "Get warehouse details by UUID" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseResponseDto)
  @ApiNotFoundResponseRfc9457()
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    const data = await this.warehouseService.findById(id);
    return apiSuccess(data);
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiAuth("ADMIN")
  @ApiOperation({ summary: "Create a new physical warehouse (Admin Only)" })
  @ApiCreatedResponseGeneric(WarehouseResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async create(@Body() dto: CreateWarehouseDto) {
    const data = await this.warehouseService.create(dto);
    return apiSuccess(data);
  }

  @Put(WAREHOUSE_ROUTES.STOCK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiAuth("ADMIN")
  @ApiOperation({
    summary:
      "Update product stock in a warehouse and atomically sync totalStockCache (Admin Only)",
  })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseStockResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async updateStock(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ) {
    const data = await this.warehouseService.updateStock(id, dto);
    return apiSuccess(data);
  }

  @Put(WAREHOUSE_ROUTES.BY_ID)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiAuth("ADMIN")
  @ApiOperation({ summary: "Update warehouse details (Admin Only)" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(WarehouseResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    const data = await this.warehouseService.update(id, dto);
    return apiSuccess(data);
  }

  @Delete(WAREHOUSE_ROUTES.BY_ID)
  @HttpCode(HttpStatus.OK)
  @ApiAuth("ADMIN")
  @ApiOperation({ summary: "Deactivate warehouse (Admin Only)" })
  @ApiParam({ name: "id", description: "Warehouse UUID" })
  @ApiOkResponseGeneric(Object)
  @ApiNotFoundResponseRfc9457()
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    await this.warehouseService.delete(id);
    return apiSuccess(null);
  }
}
