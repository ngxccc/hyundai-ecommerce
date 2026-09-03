import { mock } from "bun:test";

export function createMockQueue() {
  const mockQueue = {
    add: mock(() => Promise.resolve({})),
    clearAll() {
      this.add.mockClear();
    },
  };

  return mockQueue;
}
