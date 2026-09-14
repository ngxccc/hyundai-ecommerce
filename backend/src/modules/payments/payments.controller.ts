import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  ApiAuth,
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
  ApiBadRequestResponseRfc9457,
  ApiNotFoundResponseRfc9457,
  Public,
} from "@/common/decorators";
import { Throttle } from "@nestjs/throttler";
import {
  CurrentUser,
  type JwtPayload,
} from "@/common/decorators/current-user.decorator";
import { apiSuccess } from "@/common/utils/api-response.util";
import { PAYMENT_ROUTES } from "./payment.routes";
import { PaymentsService } from "./payments.service";
import {
  CheckoutLinkResponseDto,
  CreateCheckoutLinkDto,
  DebtRepaymentResponseDto,
  OrderPaymentSummaryDto,
  PayOSWebhookDto,
  PayOSWebhookResponseDto,
  RepayDebtDto,
  VerifyCashPaymentDto,
} from "./dto";

@ApiTags(PAYMENT_ROUTES.TAG)
@Controller({ path: PAYMENT_ROUTES.ROOT, version: "1" })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Generates a dynamic VietQR and PayOS checkout URL for an existing order.
   *
   * @param dto - Payment link generation payload specifying order ID and transaction type.
   * @returns Checkout link and QR code details.
   */
  @Public()
  @Post(PAYMENT_ROUTES.CHECKOUT_LINK)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: "Create PayOS checkout link and VietQR code",
    deprecated: true,
  })
  @ApiCreatedResponseGeneric(CheckoutLinkResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
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
  @Public()
  @Post(PAYMENT_ROUTES.PAYOS_WEBHOOK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Receive and cryptographically verify PayOS payment webhook",
    deprecated: true,
  })
  @ApiOkResponseGeneric(PayOSWebhookResponseDto)
  @ApiBadRequestResponseRfc9457()
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
  @ApiAuth("ADMIN", "SALES")
  @ApiOperation({
    summary:
      "Verify offline cash payment (Deprecated: use POST /orders/:id/verify-cash)",
    deprecated: true,
  })
  @ApiParam({ name: "id", description: "Order UUID" })
  @ApiOkResponseGeneric(OrderPaymentSummaryDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
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
  @ApiAuth()
  @ApiOperation({
    summary: "Repay B2B dealer debt via PayOS gateway or cash",
    deprecated: true,
  })
  @ApiCreatedResponseGeneric(DebtRepaymentResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  async repayDebt(
    @Body() dto: RepayDebtDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const result = await this.paymentsService.repayDebt(
      dto,
      currentUser.sub,
      currentUser.role,
    );
    return apiSuccess(result);
  }

  /**
   * Retrieves order payment status, balance breakdown, and transaction history.
   *
   * @param orderId - Order UUID identifier.
   * @returns Detailed payment summary for the order.
   */
  @Get(PAYMENT_ROUTES.BY_ORDER_ID)
  @ApiAuth()
  @ApiOperation({
    summary: "Get order payment status and transactions",
    deprecated: true,
  })
  @ApiOkResponseGeneric(OrderPaymentSummaryDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  async getOrderPaymentSummary(
    @Param("orderId", ParseUUIDPipe) orderId: string,
  ) {
    const result = await this.paymentsService.getOrderPaymentSummary(orderId);
    return apiSuccess(result);
  }
}
