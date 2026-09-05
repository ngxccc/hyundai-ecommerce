import { beforeEach, describe, expect, test } from "bun:test";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import type { DrizzleDB } from "@/database/database.module";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";

describe("CategoriesService", () => {
  let service: CategoriesService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new CategoriesService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("findAll()", () => {
    describe("when categories exist", () => {
      test("should return all categories ordered by nameVi", async () => {
        const mockCategories = [
          {
            id: "cat-1",
            nameVi: "Máy phát điện",
            nameEn: "Generators",
            slug: "may-phat-dien",
            parentId: null,
            descriptionVi: null,
            descriptionEn: null,
            image: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockDb.setSelectResult(mockCategories);

        const result = await service.findAll();

        expect(result.length).toBe(1);
        expect(result[0]?.slug).toBe("may-phat-dien");
      });
    });
  });

  describe("getTree()", () => {
    describe("when hierarchical categories exist", () => {
      test("should assemble parent and child categories into recursive tree", async () => {
        const parentCat = {
          id: "parent-1",
          nameVi: "Máy phát điện",
          nameEn: "Generators",
          slug: "may-phat-dien",
          parentId: null,
          descriptionVi: null,
          descriptionEn: null,
          image: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const childCat = {
          id: "child-1",
          nameVi: "Máy phát điện Diesel",
          nameEn: "Diesel Generators",
          slug: "may-phat-dien-diesel",
          parentId: "parent-1",
          descriptionVi: null,
          descriptionEn: null,
          image: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([parentCat, childCat]);

        const tree = await service.getTree();

        expect(tree.length).toBe(1);
        expect(tree[0]?.id).toBe("parent-1");
        expect(tree[0]?.children?.length).toBe(1);
        expect(tree[0]?.children?.[0]?.id).toBe("child-1");
      });
    });
  });

  describe("findById()", () => {
    describe("when category exists", () => {
      test("should return category details matching ID", async () => {
        const mockCategory = {
          id: "cat-find",
          nameVi: "Bộ lưu điện UPS",
          nameEn: "UPS",
          slug: "bo-luu-dien-ups",
          parentId: null,
          descriptionVi: null,
          descriptionEn: null,
          image: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([mockCategory]);

        const result = await service.findById("cat-find");

        expect(result.id).toBe("cat-find");
        expect(result.nameVi).toBe("Bộ lưu điện UPS");
      });
    });

    describe("when category does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("create()", () => {
    describe("when slug already exists", () => {
      test("should throw ConflictException", () => {
        mockDb.setSelectResult([{ id: "existing-cat" }]);

        expect(
          service.create({
            nameVi: "Danh mục trùng",
            slug: "danh-muc-trung",
            isActive: true,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe("when parentId does not exist", () => {
      test("should throw BadRequestException", () => {
        // 1st select: slug check (none)
        // 2nd select: parent check (none)
        mockDb.setSelectResultsQueue([[], []]);

        expect(
          service.create({
            nameVi: "Danh mục con",
            slug: "danh-muc-con",
            parentId: "invalid-parent",
            isActive: true,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("when valid payload provided", () => {
      test("should insert and return created category", async () => {
        const newCategory = {
          id: "cat-new",
          nameVi: "Tủ chuyển nguồn ATS",
          nameEn: "ATS Panels",
          slug: "tu-chuyen-nguon-ats",
          parentId: null,
          descriptionVi: null,
          descriptionEn: null,
          image: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 1st select: slug check (none)
        // 2nd returning: inserted category
        mockDb.setSelectResultsQueue([[], [newCategory]]);

        const result = await service.create({
          nameVi: "Tủ chuyển nguồn ATS",
          slug: "tu-chuyen-nguon-ats",
          isActive: true,
        });

        expect(result.id).toBe("cat-new");
        expect(result.slug).toBe("tu-chuyen-nguon-ats");
      });
    });
  });

  describe("update()", () => {
    describe("when category does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(
          service.update("non-existent", { nameVi: "Tên mới" }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe("when category is assigned to itself as parent", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResult([{ id: "self-cat", slug: "self-cat" }]);

        expect(
          service.update("self-cat", { parentId: "self-cat" }),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("delete()", () => {
    describe("when category exists", () => {
      test("should delete category record from database", async () => {
        mockDb.setSelectResult([{ id: "cat-del" }]);

        await service.delete("cat-del");

        expect(mockDb.delete).toHaveBeenCalled();
      });
    });

    describe("when category does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.delete("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
