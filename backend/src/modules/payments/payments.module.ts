import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { RedlockService } from "@/common/services/redlock.service";
import { PAYMENT_GATEWAY_TOKEN } from "./interfaces/payment-gateway.interface";
import { PayOSGateway } from "./gateways/payos.gateway";
import { MockPaymentGateway } from "./gateways/mock-payment.gateway";
import { env } from "@/env";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    RedlockService,
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass:
        env.PAYMENT_DRIVER === "payos" ? PayOSGateway : MockPaymentGateway,
    },
  ],
  exports: [PaymentsService, PAYMENT_GATEWAY_TOKEN],
})
export class PaymentsModule {}
