import type { OutboxService, PendingOutboxEvent } from "./outbox.interface";
import {
  outboxEvents,
  type OutboxEvent,
  type OutboxEventStatus,
} from "../../schemas";
import { eq, inArray } from "drizzle-orm";
import type { IDatabase } from "../../client";

export class DbOutboxService implements OutboxService {
  constructor(protected readonly db: IDatabase) {}

  async fetchPendingEvents(limit: number): Promise<PendingOutboxEvent[]> {
    return await this.db.transaction(async (tx) => {
      const events = await tx
        .select({
          id: outboxEvents.id,
          eventType: outboxEvents.eventType,
          payload: outboxEvents.payload,
          retryCount: outboxEvents.retryCount,
        })
        .from(outboxEvents)
        .where(eq(outboxEvents.status, "PENDING"))
        .limit(limit)
        .for("update", { skipLocked: true });

      if (events.length > 0) {
        const ids = events.map((e) => e.id);
        await tx
          .update(outboxEvents)
          .set({ status: "PROCESSING", updatedAt: new Date() })
          .where(inArray(outboxEvents.id, ids));
      }

      return events;
    });
  }

  async updateStatus(
    id: string,
    status: OutboxEventStatus,
    error?: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const updates: Partial<OutboxEvent> = { status };
      if (status === "PROCESSED") {
        updates.processedAt = new Date();
      } else if (status === "FAILED" || status === "PENDING") {
        const [event] = await tx
          .select({ retryCount: outboxEvents.retryCount })
          .from(outboxEvents)
          .where(eq(outboxEvents.id, id))
          .limit(1);

        if (event) {
          updates.retryCount = event.retryCount + 1;
        }
        updates.lastError = error ?? null;
      }

      await tx.update(outboxEvents).set(updates).where(eq(outboxEvents.id, id));
    });
  }
}
