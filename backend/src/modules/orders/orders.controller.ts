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
  Public,
} from "@/common/decorators";
import type { PaginationMetaDto } from "@/common/dto/pagination-meta.dto";
import {
  CurrentUser,
  type JwtPayload,
} from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
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
  ExpireOrdersResponseDto,
  VerifyCashPaymentDto,
} from "./dto";

@ApiTags(ORDER_ROUTES.TAG)
@Controller({ path: ORDER_ROUTES.ROOT, version: "1" })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Places a retail order for guest storefront customers without requiring user accounts.
   *
   * @param dto - Guest checkout details and line items.
   * @returns Created order response.
   */
  @Public()
  @Post(ORDER_ROUTES.CHECKOUT)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: "Guest checkout for storefront retail customers",
    deprecated: true,
    description:
      "Legacy B2C retail checkout endpoint. In the B2B industrial machinery domain, orders originate from approved quotations via `/api/v1/quotes/:id/approve-to-order` or official B2B contract creation (`/api/v1/orders/admin`).",
  })
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
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cancel order and release reserved stock (Admin only)",
  })
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
   * Confirms offline cash or direct bank transfer payment collected for an order (Admin/Accountant).
   *
   * @param id - Order UUID identifier.
   * @param dto - Cash verification payload with collected amount and notes.
   * @param adminUserId - Authenticated admin/sales user performing verification.
   * @returns Updated order details.
   */
  @Post(ORDER_ROUTES.VERIFY_CASH)
  @HttpCode(HttpStatus.OK)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify offline cash payment (Admin/Accountant)" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiOkResponseGeneric(OrderResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async verifyCashPayment(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: VerifyCashPaymentDto,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const result = await this.ordersService.verifyCashPayment(
      id,
      dto,
      adminUserId,
    );
    return apiSuccess(result);
  }

  /**
   * Triggers scheduled auto-expiration of pending unpaid orders beyond threshold (ADR 0012).
   *
   * @returns Count of auto-expired orders.
   */
  @Public()
  @Post(ORDER_ROUTES.EXPIRE_CRON)
  @HttpCode(HttpStatus.OK)
  @UseGuards(CronAuthGuard)
  @ApiOperation({
    summary: "Auto-expire pending unpaid orders and restock inventory (Cron)",
    deprecated: true,
    description:
      "Legacy B2C 15-minute checkout expiration. B2B high-value industrial machinery orders operate on negotiated commercial terms and corporate wire transfers rather than instant payment timeouts.",
  })
  @ApiOkResponseGeneric(ExpireOrdersResponseDto)
  @ApiUnauthorizedResponseRfc9457()
  async expireOrders() {
    const expiredCount = await this.ordersService.expirePendingOrders();
    return apiSuccess({ expiredCount });
  }
}
