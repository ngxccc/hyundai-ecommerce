import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { and, eq, lte } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "../../../database/database.module";
import { outboxEvents } from "../../../database/schemas";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";
import { getPastDate } from "@/common/utils/date.util";
import { OUTBOX_JOBS, OUTBOX_CONFIG } from "../outbox.constants";

@Processor(QUEUE_NAMES.OUTBOX)
export class OutboxCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboxCleanupProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {
    super();
  }

  async process(
    job: Job<unknown, unknown>,
  ): Promise<{ purgedCount: number } | undefined> {
    if (job.name !== OUTBOX_JOBS.CLEANUP) {
      return;
    }

    this.logger.debug(
      `Starting outbox event retention cleanup worker (${OUTBOX_CONFIG.RETENTION_DURATION})...`,
    );

    const retentionThreshold = getPastDate(OUTBOX_CONFIG.RETENTION_DURATION);

    const deletedRecords = await this.db
      .delete(outboxEvents)
      .where(
        and(
          eq(outboxEvents.status, "PROCESSED"),
          lte(outboxEvents.createdAt, retentionThreshold),
        ),
      )
      .returning({ id: outboxEvents.id });
    if (deletedRecords.length > 0) {
      this.logger.log(
        `Outbox cleanup completed. Purged ${String(deletedRecords.length)} processed events older than ${OUTBOX_CONFIG.RETENTION_DURATION}.`,
      );
    } else {
      this.logger.debug(
        `Outbox cleanup completed. No processed events older than ${OUTBOX_CONFIG.RETENTION_DURATION} to purge.`,
      );
    }

    return { purgedCount: deletedRecords.length };
  }
}
