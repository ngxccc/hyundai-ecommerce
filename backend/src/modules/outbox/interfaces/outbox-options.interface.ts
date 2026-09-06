export interface OutboxServiceOptions {
  enablePolling?: boolean;
}

export const OUTBOX_OPTIONS_TOKEN = Symbol("OUTBOX_OPTIONS_TOKEN");
