import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { apiSuccess } from "@/common/utils/api-response.util";
import { ORDER_ROUTES } from "./order.routes";
import { OrdersService } from "./orders.service";
import {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
} from "./dto";

@ApiTags(ORDER_ROUTES.TAG)
@Controller(ORDER_ROUTES.ROOT)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Places a retail order for guest storefront customers without requiring user accounts.
   *
   * @param dto - Guest checkout details and line items.
   * @returns Created order response.
   */
  @Post(ORDER_ROUTES.CHECKOUT)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Guest checkout for storefront retail customers" })
  @ApiResponse({
    status: 201,
    description: "Order placed successfully with PENDING status",
    type: OrderResponseDto,
  })
  async checkout(@Body() dto: CreateGuestOrderDto) {
    const order = await this.ordersService.createGuestOrder(dto);
    return apiSuccess(order);
  }

  /**
   * Creates an official B2B corporate order manually entered by Admin/Sales.
   *
   * @param dto - B2B order specification with customer context, custom prices, and credit terms.
   * @param adminUserId - Authenticated admin/sales user ID creating the order.
   * @returns Created order response.
   */
  @Post(ORDER_ROUTES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create official B2B order (Admin/Sales)" })
  @ApiResponse({
    status: 201,
    description: "B2B order created successfully",
    type: OrderResponseDto,
  })
  async createB2bOrder(
    @Body() dto: CreateB2bOrderDto,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const order = await this.ordersService.createB2bOrder(dto, adminUserId);
    return apiSuccess(order);
  }

  /**
   * Retrieves paginated and filtered list of orders.
   *
   * @param query - Filtering parameters and pagination options.
   * @returns Paginated list of orders.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List orders with filtering and pagination" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiQuery({ name: "paymentStatus", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Paginated list of orders retrieved successfully",
    type: PaginatedOrderResponseDto,
  })
  async listOrders(@Query() query: OrderQueryDto) {
    const result = await this.ordersService.findAll(query);
    return apiSuccess(result);
  }

  /**
   * Retrieves detailed order by UUID.
   *
   * @param id - Order UUID identifier.
   * @returns Order details with items and product summaries.
   */
  @Get(ORDER_ROUTES.BY_ID)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get detailed order by ID" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiResponse({
    status: 200,
    description: "Order details retrieved successfully",
    type: OrderResponseDto,
  })
  async getOrderById(@Param("id") id: string) {
    const order = await this.ordersService.findById(id);
    return apiSuccess(order);
  }

  /**
   * Updates order lifecycle status along the state machine (Admin/Sales).
   *
   * @param id - Order UUID identifier.
   * @param dto - Target order status and optional notes.
   * @param adminUserId - Authenticated user updating status.
   * @returns Updated order details.
   */
  @Patch(ORDER_ROUTES.STATUS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update order status along state machine" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
    type: OrderResponseDto,
  })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const order = await this.ordersService.updateStatus(
      id,
      dto.status,
      adminUserId,
      dto.note,
    );
    return apiSuccess(order);
  }

  /**
   * Cancels an order and releases reserved warehouse inventory back into stock.
   *
   * @param id - Order UUID identifier.
   * @returns Updated cancelled order details.
   */
  @Post(ORDER_ROUTES.CANCEL)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Cancel order and release reserved stock" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiResponse({
    status: 200,
    description: "Order cancelled and inventory returned to stock",
    type: OrderResponseDto,
  })
  async cancelOrder(@Param("id") id: string) {
    const order = await this.ordersService.cancelOrder(id);
    return apiSuccess(order);
  }

  /**
   * Triggers scheduled auto-expiration of pending unpaid orders beyond threshold (ADR 0012).
   *
   * @returns Count of auto-expired orders.
   */
  @Post(ORDER_ROUTES.EXPIRE_CRON)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Auto-expire pending unpaid orders and restock inventory (Cron)",
  })
  @ApiResponse({
    status: 200,
    description: "Cron execution summary with count of expired orders",
  })
  async expireOrders() {
    const expiredCount = await this.ordersService.expirePendingOrders();
    return apiSuccess({ expiredCount });
  }
}
