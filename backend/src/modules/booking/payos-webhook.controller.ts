import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiBadRequestResponseRfc9457 } from "@/common/decorators";
import {
  PayOSWebhookDto,
  PayOSWebhookResponseDto,
} from "./dto/payos-webhook.dto";
import { ConfigService } from "@nestjs/config";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import {
  isPayOSTimestampValid,
  verifyPayOSSignature,
} from "../../common/utils/payos-crypto.util";
import { BOOKING_ROUTES } from "./booking.routes";
import { LOG_EVENTS } from "@/common/constants/event.constant";

@ApiTags(BOOKING_ROUTES.PAYMENTS_BASE)
@Controller(BOOKING_ROUTES.PAYMENTS_BASE)
export class PayOSWebhookController {
  private readonly logger = new Logger(PayOSWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post(BOOKING_ROUTES.PAYOS_WEBHOOK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Process PayOS payment webhook",
    description:
      "Verifies HMAC-SHA256 signature and 5-minute anti-replay window to process payment notifications.",
  })
  @ApiBody({ type: PayOSWebhookDto })
  @ApiOkResponse({ type: PayOSWebhookResponseDto })
  @ApiBadRequestResponseRfc9457()
  handlePayOSWebhook(
    @Body() payload: PayOSWebhookDto,
  ): PayOSWebhookResponseDto {
    const checksumKey = this.configService.get<string>("PAYOS_CHECKSUM_KEY");

    // 1. Verify HMAC-SHA256 Signature (INV-6)
    if (
      !checksumKey ||
      !payload.signature ||
      !verifyPayOSSignature(
        payload.data as unknown as Record<string, unknown>,
        payload.signature,
        checksumKey,
      )
    ) {
      this.logger.warn(
        `PAYOS_WEBHOOK_INVALID_SIGNATURE: Webhook signature verification failed for orderCode ${String(payload.data.orderCode)}`,
      );
      throw new BadRequestException(
        this.i18n.t("booking.PAYOS_WEBHOOK_INVALID_SIGNATURE"),
      );
    }

    // 2. Verify 5-minute Timestamp Anti-Replay Window (INV-6)
    if (
      !payload.data.transactionDateTime ||
      !isPayOSTimestampValid(payload.data.transactionDateTime, 300)
    ) {
      this.logger.warn(
        `PAYOS_WEBHOOK_STALE_TIMESTAMP: Webhook timestamp skew exceeds 5 minutes for orderCode ${String(payload.data.orderCode)}`,
      );
      throw new BadRequestException(
        this.i18n.t("booking.PAYOS_WEBHOOK_STALE_TIMESTAMP"),
      );
    }

    this.logger.log(
      JSON.stringify({
        level: 30,
        context: PayOSWebhookController.name,
        event: LOG_EVENTS.PAYOS_WEBHOOK_RECEIVED,
        orderCode: payload.data.orderCode,
        amount: payload.data.amount,
        code: payload.code,
      }),
    );

    return { success: true, message: "Webhook processed successfully" };
  }
}
