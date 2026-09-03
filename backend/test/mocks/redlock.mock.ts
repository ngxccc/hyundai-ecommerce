import { mock } from "bun:test";

export function createMockRedlockService() {
  const mockRedis = {
    get: mock(() => Promise.resolve(null as string | null)),
    setex: mock(() => Promise.resolve("OK")),
  };

  const mockRedlockService = {
    getRedisClient: mock(() => mockRedis),
    acquireLock: mock(() =>
      Promise.resolve({ release: () => Promise.resolve() }),
    ),
    releaseLock: mock(() => Promise.resolve()),
    mockRedis,
    clearAll() {
      this.getRedisClient.mockClear();
      this.acquireLock.mockClear();
      this.releaseLock.mockClear();
      this.mockRedis.get.mockClear();
      this.mockRedis.setex.mockClear();
    },
  };

  return mockRedlockService;
}
