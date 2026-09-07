import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { I18nForbiddenException } from "@/common/exceptions";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  ApiOkResponseGeneric,
  ApiOkResponsePaginated,
  ApiCreatedResponseGeneric,
  ApiBadRequestResponseRfc9457,
  ApiNotFoundResponseRfc9457,
  ApiUnauthorizedResponseRfc9457,
  ApiForbiddenResponseRfc9457,
} from "@/common/decorators";
import type { PaginationMetaDto } from "@/common/dto/pagination-meta.dto";
import {
  CurrentUser,
  type JwtPayload,
} from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { CronAuthGuard } from "@/common/guards/cron-auth.guard";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { ORDER_ROUTES } from "./order.routes";
import { OrdersService } from "./orders.service";
import {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderResponseDto,
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
  @ApiCreatedResponseGeneric(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
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
  @ApiCreatedResponseGeneric(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
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
  @ApiOkResponsePaginated(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async listOrders(
    @Query() query: OrderQueryDto,
  ): Promise<ApiResponse<OrderResponseDto[], PaginationMetaDto>> {
    const { items, meta } = await this.ordersService.findAll(query);
    return apiSuccess(items, meta);
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
  @ApiOkResponseGeneric(OrderResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async getOrderById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const order = await this.ordersService.findById(id);
    if (
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "SALES" &&
      order.userId !== currentUser.sub
    ) {
      throw new I18nForbiddenException("orders.FORBIDDEN_ACCESS");
    }
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
  @ApiOkResponseGeneric(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel order and release reserved stock" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiOkResponseGeneric(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async cancelOrder(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const cancelled = await this.ordersService.cancelOrder(
      id,
      null,
      currentUser,
    );
    return apiSuccess(cancelled);
  }

  /**
   * Triggers scheduled auto-expiration of pending unpaid orders beyond threshold (ADR 0012).
   *
   * @returns Count of auto-expired orders.
   */
  @Post(ORDER_ROUTES.EXPIRE_CRON)
  @HttpCode(HttpStatus.OK)
  @UseGuards(CronAuthGuard)
  @ApiOperation({
    summary: "Auto-expire pending unpaid orders and restock inventory (Cron)",
  })
  @ApiOkResponseGeneric()
  @ApiUnauthorizedResponseRfc9457()
  async expireOrders() {
    const expiredCount = await this.ordersService.expirePendingOrders();
    return apiSuccess({ expiredCount });
  }
}
