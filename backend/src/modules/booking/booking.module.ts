import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { RedlockService } from "../../common/services/redlock.service";
import { BookingController } from "./booking.controller";
import { PayOSWebhookController } from "./payos-webhook.controller";
import { BookingService } from "./booking.service";
import { BookingCancellationProcessor } from "./processors/booking-cancellation.processor";
import { PaymentReconciliationProcessor } from "./processors/payment-reconciliation.processor";
import { BookingCronService } from "./booking-cron.service";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.BOOKING,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: {
          count: 1000,
        },
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [BookingController, PayOSWebhookController],
  providers: [
    BookingService,
    RedlockService,
    BookingCancellationProcessor,
    PaymentReconciliationProcessor,
    BookingCronService,
  ],
  exports: [BookingService, RedlockService],
})
export class BookingModule {}
