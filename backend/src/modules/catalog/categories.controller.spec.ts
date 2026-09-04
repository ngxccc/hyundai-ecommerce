import { beforeEach, describe, expect, test, mock } from "bun:test";
import { CategoriesController } from "./categories.controller";
import type { CategoriesService } from "./categories.service";
import type { CategoryResponseDto } from "./dto/category-response.dto";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { UpdateCategoryDto } from "./dto/update-category.dto";

describe("CategoriesController", () => {
  let controller: CategoriesController;

  const mockCategory: CategoryResponseDto = {
    id: "cat-1",
    nameVi: "Máy phát điện",
    nameEn: "Generators",
    slug: "may-phat-dien",
    parentId: null,
    descriptionVi: null,
    descriptionEn: null,
    image: null,
    isActive: true,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockCategoriesService = {
    findAll: mock(() => Promise.resolve([mockCategory])),
    getTree: mock(() => Promise.resolve([mockCategory])),
    findById: mock((_id: string) => Promise.resolve(mockCategory)),
    create: mock((_dto: CreateCategoryDto) => Promise.resolve(mockCategory)),
    update: mock((_id: string, _dto: UpdateCategoryDto) =>
      Promise.resolve(mockCategory),
    ),
    delete: mock((_id: string) => Promise.resolve()),
    clearAll() {
      this.findAll.mockClear();
      this.getTree.mockClear();
      this.findById.mockClear();
      this.create.mockClear();
      this.update.mockClear();
      this.delete.mockClear();
    },
  };

  beforeEach(() => {
    mockCategoriesService.clearAll();
    controller = new CategoriesController(
      mockCategoriesService as unknown as CategoriesService,
    );
  });

  describe("GET /categories", () => {
    describe("when client queries all categories", () => {
      test("should return wrapped list of categories", async () => {
        const result = await controller.getAll();

        expect(mockCategoriesService.findAll).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(1);
      });
    });
  });

  describe("GET /categories/tree", () => {
    describe("when client queries category tree", () => {
      test("should return wrapped category hierarchy tree", async () => {
        const result = await controller.getTree();

        expect(mockCategoriesService.getTree).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });
    });
  });

  describe("GET /categories/:id", () => {
    describe("when client queries category by id", () => {
      test("should return wrapped category details", async () => {
        const result = await controller.getById("cat-1");

        expect(mockCategoriesService.findById).toHaveBeenCalledWith("cat-1");
        expect(result.data.id).toBe("cat-1");
      });
    });
  });

  describe("POST /categories", () => {
    describe("when admin creates category", () => {
      test("should return wrapped created category", async () => {
        const dto: CreateCategoryDto = {
          nameVi: "Máy phát điện",
          slug: "may-phat-dien",
          isActive: true,
        };

        const result = await controller.create(dto);

        expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
        expect(result.data.nameVi).toBe("Máy phát điện");
      });
    });
  });

  describe("PUT /categories/:id", () => {
    describe("when admin updates category", () => {
      test("should return wrapped updated category", async () => {
        const dto: UpdateCategoryDto = { nameVi: "Máy phát điện mới" };

        const result = await controller.update("cat-1", dto);

        expect(mockCategoriesService.update).toHaveBeenCalledWith("cat-1", dto);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("DELETE /categories/:id", () => {
    describe("when admin deletes category", () => {
      test("should return wrapped success response with null data", async () => {
        const result = await controller.delete("cat-1");

        expect(mockCategoriesService.delete).toHaveBeenCalledWith("cat-1");
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });
  });
});
