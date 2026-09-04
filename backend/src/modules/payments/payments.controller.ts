import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { apiSuccess } from "@/common/utils/api-response.util";
import { PAYMENT_ROUTES } from "./payment.routes";
import { PaymentsService } from "./payments.service";
import {
  CheckoutLinkResponseDto,
  CreateCheckoutLinkDto,
  DebtRepaymentResponseDto,
  OrderPaymentSummaryDto,
  PayOSWebhookDto,
  RepayDebtDto,
  VerifyCashPaymentDto,
} from "./dto";

@ApiTags(PAYMENT_ROUTES.TAG)
@Controller(PAYMENT_ROUTES.ROOT)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Generates a dynamic VietQR and PayOS checkout URL for an existing order.
   *
   * @param dto - Payment link generation payload specifying order ID and transaction type.
   * @returns Checkout link and QR code details.
   */
  @Post(PAYMENT_ROUTES.CHECKOUT_LINK)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Create PayOS checkout link and VietQR code" })
  @ApiResponse({
    status: 201,
    description: "Checkout link created successfully",
    type: CheckoutLinkResponseDto,
  })
  async createCheckoutLink(@Body() dto: CreateCheckoutLinkDto) {
    const result = await this.paymentsService.createCheckoutLink(dto);
    return apiSuccess(result);
  }

  /**
   * Public webhook endpoint invoked by PayOS to notify payment completion.
   *
   * @param dto - Incoming PayOS webhook payload with signature.
   * @returns Webhook processing confirmation.
   */
  @Post(PAYMENT_ROUTES.PAYOS_WEBHOOK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Receive and cryptographically verify PayOS payment webhook",
  })
  @ApiResponse({
    status: 200,
    description: "Webhook processed idempotently",
  })
  async handleWebhook(@Body() dto: PayOSWebhookDto) {
    const result = await this.paymentsService.handlePayOSWebhook(dto);
    return apiSuccess(result);
  }

  /**
   * Allows Accountant or Admin to confirm offline cash payment collected for an order.
   *
   * @param id - Order UUID identifier.
   * @param dto - Cash verification payload with collected amount and notes.
   * @param adminUserId - Authenticated admin user performing verification.
   * @returns Updated order payment summary.
   */
  @Post(PAYMENT_ROUTES.VERIFY_CASH)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify offline cash payment (Admin/Accountant)" })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiResponse({
    status: 200,
    description: "Cash payment confirmed and order marked fully paid",
    type: OrderPaymentSummaryDto,
  })
  async verifyCashPayment(
    @Param("id") id: string,
    @Body() dto: VerifyCashPaymentDto,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const result = await this.paymentsService.verifyCashPayment(
      id,
      dto,
      adminUserId,
    );
    return apiSuccess(result);
  }

  /**
   * Initiates B2B dealer debt repayment via PayOS online gateway or Admin cash confirmation.
   *
   * @param dto - Debt repayment specification.
   * @param currentUserId - Authenticated user initiating repayment.
   * @returns Registered debt repayment transaction with PayOS link or confirmation.
   */
  @Post(PAYMENT_ROUTES.REPAY_DEBT)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Repay B2B dealer debt via PayOS gateway or cash",
  })
  @ApiResponse({
    status: 201,
    description: "Debt repayment processed or online link generated",
    type: DebtRepaymentResponseDto,
  })
  async repayDebt(
    @Body() dto: RepayDebtDto,
    @CurrentUser("sub") currentUserId: string,
  ) {
    const result = await this.paymentsService.repayDebt(dto, currentUserId);
    return apiSuccess(result);
  }

  /**
   * Retrieves order payment status, balance breakdown, and transaction history.
   *
   * @param orderId - Order UUID identifier.
   * @returns Detailed payment summary for the order.
   */
  @Get(PAYMENT_ROUTES.BY_ORDER_ID)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get order payment status and transactions" })
  @ApiParam({ name: "orderId", description: "Order UUID" })
  @ApiResponse({
    status: 200,
    description: "Order payment summary retrieved successfully",
    type: OrderPaymentSummaryDto,
  })
  async getOrderPaymentSummary(@Param("orderId") orderId: string) {
    const result = await this.paymentsService.getOrderPaymentSummary(orderId);
    return apiSuccess(result);
  }
}
