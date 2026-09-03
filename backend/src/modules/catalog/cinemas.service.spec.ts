import { beforeEach, describe, expect, it } from "bun:test";
import { CinemasService } from "./cinemas.service";
import type { DrizzleDB } from "@/database/database.module";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";

describe("CinemasService (Unit)", () => {
  let service: CinemasService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new CinemasService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("findCinemas", () => {
    it("should return empty data array when total count is 0", async () => {
      mockDb.setSelectResult([{ count: 0 }]);

      const result = await service.findCinemas({
        page: 1,
        limit: 20,
        city: "NonExistentCity",
      });

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });
});
