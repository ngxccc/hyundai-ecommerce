import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { RedlockService } from "@/common/services/redlock.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, RedlockService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
