import {
  Injectable,
  Logger,
  Inject,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { outboxEvents } from "@/database/schemas";
import { eq } from "drizzle-orm";
import {
  OUTBOX_EVENT_TYPE,
  MAIL_JOB_NAME,
} from "@/common/constants/event.constant";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";

const EVENT_TO_JOB_MAP: Record<string, string> = {
  [OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED]:
    MAIL_JOB_NAME.SEND_VERIFICATION,
  [OUTBOX_EVENT_TYPE.AUTH_RESET_PASSWORD_EMAIL_REQUESTED]:
    MAIL_JOB_NAME.SEND_RESET_PASSWORD,
};

const MAX_OUTBOX_ATTEMPTS = 3;

@Injectable()
export class OutboxService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(OutboxService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    @InjectQueue(QUEUE_NAMES.MAIL)
    private readonly mailQueue: Queue,
  ) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") return;
    // WHY: Polling interval of 5 seconds to process outbox events while keeping DB CPU usage low.
    this.timer = setInterval(() => {
      void this.processOutbox();
    }, 5000);
    this.logger.log("Outbox Relay Worker started polling.");
  }

  onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.logger.log("Outbox Relay Worker stopped polling.");
  }

  async processOutbox() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      const pendingEvents = await this.db.transaction(async (tx) => {
        return tx
          .select({
            id: outboxEvents.id,
            eventType: outboxEvents.eventType,
            payload: outboxEvents.payload,
            attempts: outboxEvents.attempts,
          })
          .from(outboxEvents)
          .where(eq(outboxEvents.status, "PENDING"))
          .limit(10)
          .for("update", { skipLocked: true });
      });

      if (pendingEvents.length === 0) {
        return;
      }

      this.logger.debug(
        `Processing ${String(pendingEvents.length)} pending outbox events...`,
      );

      for (const event of pendingEvents) {
        try {
          await this.dispatch(event.eventType, event.payload);

          await this.db
            .update(outboxEvents)
            .set({
              status: "PROCESSED",
              processedAt: new Date(),
              attempts: event.attempts + 1,
              lastError: null,
            })
            .where(eq(outboxEvents.id, event.id));

          this.logger.debug(
            `Event ${event.id} (${event.eventType}) processed successfully.`,
          );
        } catch (error) {
          const nextAttempts = event.attempts + 1;
          const maxAttempts = MAX_OUTBOX_ATTEMPTS;
          const isFailed = nextAttempts >= maxAttempts;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this.logger.error(
            `Failed to process event ${event.id} (${event.eventType}). Attempt ${String(nextAttempts)}/${String(maxAttempts)}`,
            error,
          );

          await this.db
            .update(outboxEvents)
            .set({
              status: isFailed ? "FAILED" : "PENDING",
              processedAt: null,
              attempts: nextAttempts,
              lastError: errorMessage,
            })
            .where(eq(outboxEvents.id, event.id));
        }
      }
    } catch (error) {
      this.logger.error(
        "Error occurred while processing outbox events.",
        error,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async dispatch(eventType: string, payload: unknown) {
    const jobName = EVENT_TO_JOB_MAP[eventType];

    if (!jobName) {
      this.logger.warn(`No BullMQ job mapping found for event: ${eventType}`);
      return;
    }

    const { promise: timeoutPromise, reject } = Promise.withResolvers<never>();
    const timer = setTimeout(() => {
      reject(new Error("BullMQ mailQueue.add timeout after 5s"));
    }, 5000);

    await Promise.race([
      this.mailQueue
        .add(jobName, payload, {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        })
        .finally(() => {
          clearTimeout(timer);
        }),
      timeoutPromise,
    ]);
  }
}
