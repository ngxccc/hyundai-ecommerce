import type { OutboxEvent, OutboxEventStatus } from "../../schemas";

export type PendingOutboxEvent = Pick<
  OutboxEvent,
  "id" | "eventType" | "payload" | "retryCount"
>;

export interface OutboxService {
  fetchPendingEvents(limit: number): Promise<PendingOutboxEvent[]>;
  updateStatus(
    id: string,
    status: OutboxEventStatus,
    error?: string,
  ): Promise<void>;
}
