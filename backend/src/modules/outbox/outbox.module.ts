import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { OutboxService } from "./outbox.service";
import { OutboxCleanupProcessor } from "./processors/outbox-cleanup.processor";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.MAIL },
      { name: QUEUE_NAMES.OUTBOX },
    ),
  ],
  providers: [OutboxService, OutboxCleanupProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
