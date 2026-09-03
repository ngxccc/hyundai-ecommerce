import { mock } from "bun:test";

export function createMockI18nService() {
  const mockI18nService = {
    t: mock((key: string) => key),
    clearAll() {
      this.t.mockClear();
    },
  };

  return mockI18nService;
}
