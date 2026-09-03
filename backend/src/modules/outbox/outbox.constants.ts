import { QUEUE_NAMES } from "@/common/constants/queue.constants";

export const OUTBOX_QUEUES = {
  OUTBOX: QUEUE_NAMES.OUTBOX,
} as const;

export const OUTBOX_JOBS = {
  CLEANUP: "outbox-cleanup",
} as const;
export const OUTBOX_CONFIG = {
  RETENTION_DURATION: "7d",
} as const;
