import { TokenCleanupService } from "./token-cleanup.service";
import type { DrizzleDB } from "@/database/database.module";
import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { createMockDb } from "../../../test/mocks";

describe("TokenCleanupService", () => {
  let service: TokenCleanupService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new TokenCleanupService(mockDb as unknown as DrizzleDB);
  });

  describe("when initializing and shutting down module lifecycle", () => {
    it("should instantiate TokenCleanupService correctly", () => {
      expect(service).toBeDefined();
    });

    it("should register daily interval timer and trigger initial cleanup when onApplicationBootstrap is called", () => {
      const originalSetInterval = globalThis.setInterval;
      const setIntervalMock = mock((cb: () => void) => {
        cb();
        return 0 as unknown as ReturnType<typeof setInterval>;
      });
      globalThis.setInterval = setIntervalMock as unknown as typeof setInterval;

      const cleanupSpy = spyOn(service, "cleanupTokens").mockImplementation(
        () => Promise.resolve(),
      );

      try {
        service.onApplicationBootstrap();
        expect(setIntervalMock).toHaveBeenCalledTimes(1);
        expect(cleanupSpy).toHaveBeenCalled();
      } finally {
        globalThis.setInterval = originalSetInterval;
        cleanupSpy.mockRestore();
      }
    });

    it("should clear active interval timer when onApplicationShutdown is called", () => {
      const originalClearInterval = globalThis.clearInterval;
      const clearIntervalMock = mock(() => undefined);
      globalThis.clearInterval = clearIntervalMock;

      try {
        service.onApplicationShutdown();
        expect(clearIntervalMock).toHaveBeenCalledTimes(1);
      } finally {
        globalThis.clearInterval = originalClearInterval;
      }
    });
  });

  describe("when cleaning up expired refresh tokens", () => {
    it("should execute database delete with expiration filter when cleanupTokens is called", async () => {
      await service.cleanupTokens();
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it("should catch and log database errors gracefully when database delete fails", async () => {
      const errorSpy = spyOn(
        (service as unknown as { logger: { error: () => void } }).logger,
        "error",
      ).mockImplementation(() => undefined);

      Object.defineProperty(mockDb, "delete", {
        value: mock(() => {
          throw new Error("Database connection dropped");
        }),
        configurable: true,
      });

      await service.cleanupTokens();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      errorSpy.mockRestore();
    });
  });
});
