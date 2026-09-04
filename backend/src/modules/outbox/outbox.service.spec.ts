import { OutboxService } from "./outbox.service";
import type { DrizzleDB } from "@/database/database.module";
import type { Queue } from "bullmq";
import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { createMockDb } from "../../../test/mocks";
import {
  OUTBOX_EVENT_TYPE,
  MAIL_JOB_NAME,
} from "@/common/constants/event.constant";

const mockQueue = {
  add: mock(() => Promise.resolve({})),
  clearAll() {
    this.add.mockClear();
  },
};

describe("OutboxService", () => {
  let service: OutboxService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    mockQueue.clearAll();

    service = new OutboxService(
      mockDb as unknown as DrizzleDB,
      mockQueue as unknown as Queue,
    );
    spyOn(
      (service as unknown as { logger: { error: () => void } }).logger,
      "error",
    ).mockImplementation(() => undefined);
    spyOn(
      (service as unknown as { logger: { warn: () => void } }).logger,
      "warn",
    ).mockImplementation(() => undefined);
  });

  describe("when managing worker lifecycle", () => {
    it("should instantiate OutboxService correctly", () => {
      expect(service).toBeDefined();
    });

    it("should skip starting polling interval when running in test environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      const setIntervalSpy = spyOn(globalThis, "setInterval");
      try {
        service.onApplicationBootstrap();
        expect(setIntervalSpy).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalEnv;
        setIntervalSpy.mockRestore();
      }
    });

    it("should start 5-second polling interval and trigger processOutbox when running in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const originalSetInterval = globalThis.setInterval;
      const setIntervalMock = mock((cb: () => void) => {
        cb();
        return 0 as unknown as ReturnType<typeof setInterval>;
      });
      globalThis.setInterval = setIntervalMock as unknown as typeof setInterval;

      const processSpy = spyOn(service, "processOutbox").mockImplementation(
        () => Promise.resolve(),
      );

      try {
        service.onApplicationBootstrap();
        expect(setIntervalMock).toHaveBeenCalledTimes(1);
        expect(processSpy).toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalEnv;
        globalThis.setInterval = originalSetInterval;
        processSpy.mockRestore();
      }
    });

    it("should clear active polling timer when onApplicationShutdown is called", () => {
      const originalClearInterval = globalThis.clearInterval;
      const clearIntervalMock = mock(() => undefined);
      globalThis.clearInterval = clearIntervalMock;

      Object.defineProperty(service, "timer", {
        value: 123,
        writable: true,
        configurable: true,
      });

      try {
        service.onApplicationShutdown();
        expect(clearIntervalMock).toHaveBeenCalledTimes(1);
      } finally {
        globalThis.clearInterval = originalClearInterval;
      }
    });
  });

  describe("when processing outbox events", () => {
    it("should skip execution when another processing loop is already in progress", async () => {
      Object.defineProperty(service, "isProcessing", {
        value: true,
        writable: true,
        configurable: true,
      });

      await service.processOutbox();
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it("should process pending events, dispatch to queue, and mark as processed when valid", async () => {
      const mockEvent = {
        id: "event-uuid",
        eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
        payload: {
          email: "test@example.com",
          fullName: "Test User",
          token: "token123",
        },
        status: "pending",
        attempts: 0,
      };

      mockDb.setSelectResult([mockEvent]);

      await service.processOutbox();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        MAIL_JOB_NAME.SEND_VERIFICATION,
        mockEvent.payload,
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "PROCESSED",
        }),
      );
    });

    it("should warn and skip queue dispatch when event type has no job mapping", async () => {
      const unmappedEvent = {
        id: "event-unmapped-uuid",
        eventType: "UNMAPPED_UNKNOWN_EVENT",
        payload: { some: "data" },
        status: "PENDING",
        attempts: 0,
      };

      mockDb.setSelectResult([unmappedEvent]);

      await service.processOutbox();

      expect(mockQueue.add).not.toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "PROCESSED",
        }),
      );
    });

    it("should keep outbox event pending and increment attempts on first failure", async () => {
      const mockEvent = {
        id: "event-uuid",
        eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
        payload: {
          email: "test@example.com",
          fullName: "Test User",
          token: "token123",
        },
        status: "PENDING",
        attempts: 0,
      };

      mockDb.setSelectResult([mockEvent]);
      mockQueue.add.mockImplementationOnce(() => {
        throw new Error("Queue error");
      });

      await service.processOutbox();

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "PENDING",
          attempts: 1,
          lastError: "Queue error",
        }),
      );
    });

    it("should handle queue timeout and increment attempts when queue add times out", async () => {
      const originalSetTimeout = globalThis.setTimeout;
      const setTimeoutMock = mock((cb: () => void) => {
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });
      globalThis.setTimeout = setTimeoutMock as unknown as typeof setTimeout;

      const timeoutEvent = {
        id: "event-timeout-uuid",
        eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
        payload: { email: "timeout@example.com" },
        status: "PENDING",
        attempts: 0,
      };

      mockDb.setSelectResult([timeoutEvent]);
      mockQueue.add.mockImplementationOnce(
        () => new Promise<never>(() => undefined),
      );

      try {
        await service.processOutbox();
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "PENDING",
            attempts: 1,
            lastError: "BullMQ mailQueue.add timeout after 5s",
          }),
        );
      } finally {
        globalThis.setTimeout = originalSetTimeout;
      }
    });

    it("should mark outbox event as failed when max attempts are reached", async () => {
      const failedEvent = {
        id: "event-failed-uuid",
        eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
        payload: {
          email: "test@example.com",
          fullName: "Test User",
          token: "token123",
        },
        status: "PENDING",
        attempts: 2, // Next attempt will be 3 (MAX_OUTBOX_ATTEMPTS)
      };

      mockDb.setSelectResult([failedEvent]);
      mockQueue.add.mockImplementationOnce(() => {
        throw new Error("Queue error");
      });

      await service.processOutbox();

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "FAILED",
          attempts: 3,
          lastError: "Queue error",
        }),
      );
    });

    it("should catch and log database errors gracefully when database transaction throws", async () => {
      Object.defineProperty(mockDb, "transaction", {
        value: mock(() => {
          throw new Error("Database transaction dropped");
        }),
        configurable: true,
      });

      await service.processOutbox();
    });
  });
});
