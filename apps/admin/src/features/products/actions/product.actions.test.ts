import {
  expect,
  test,
  describe,
  beforeEach,
  spyOn,
  mock,
  type Mock,
} from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { productService } from "@nhatnang/database/services";
import type { ProductDTO } from "@nhatnang/database/dtos";
import type { CreateProductInput } from "@nhatnang/database/validators";
import {
  createProductAction,
  updateProductAction,
  searchProductsAction,
} from "./product.actions";
import { uploadToCloudinary, deleteFromCloudinary } from "@/shared/services";
import { after } from "next/server";

await mock.module("@/shared/services", () => ({
  uploadToCloudinary: mock().mockResolvedValue(
    "http://cloudinary.com/mock-image.png",
  ),
  deleteFromCloudinary: mock().mockResolvedValue(true),
  validateUploadedFile: mock().mockReturnValue({ valid: true }),
}));

describe("product.actions", () => {
  beforeEach(() => {
    (
      uploadToCloudinary as unknown as Mock<typeof uploadToCloudinary>
    ).mockClear();
    (
      deleteFromCloudinary as unknown as Mock<typeof deleteFromCloudinary>
    ).mockClear();
    (after as unknown as Mock<typeof after>).mockClear();
  });

  test("createProductAction returns validation error for empty input", async () => {
    const createSpy = spyOn(productService, "create");
    const formData = new FormData();
    formData.append("payload", "{}");

    const result = await createProductAction(formData);

    expect(result.success).toBe(false);
    expect(result.success === false && result.code).toBe(
      SYSTEM_ERROR_CODES.VALIDATION_ERROR,
    );
    expect(createSpy).not.toHaveBeenCalled();
    createSpy.mockRestore();
  });

  test("createProductAction saves product and triggers background upload", async () => {
    const mockProduct: ProductDTO = {
      id: "prod-1",
      nameVi: "Test Product",
      nameEn: null,
      slug: "test",
      price: "1000",
      descriptionVi: null,
      descriptionEn: null,
      shortDescriptionVi: null,
      shortDescriptionEn: null,
      images: [],
      brandId: null,
      categoryId: null,
      specs: {},
      totalStockCache: 0,
      isQuoteOnly: false,
    };

    const createSpy = spyOn(productService, "create").mockResolvedValueOnce(
      mockProduct,
    );
    const updateSpy = spyOn(productService, "update").mockResolvedValueOnce(
      mockProduct,
    );
    (
      uploadToCloudinary as unknown as Mock<typeof uploadToCloudinary>
    ).mockResolvedValue("https://res.cloudinary.com/test");

    const validData: CreateProductInput = {
      nameVi: "Test Product",
      nameEn: null,
      slug: "test-product",
      price: "1000",
      descriptionVi: null,
      descriptionEn: null,
      shortDescriptionVi: null,
      shortDescriptionEn: null,
      images: [],
      isQuoteOnly: false,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(validData));
    formData.append(
      "images",
      new Blob(["test"], { type: "image/png" }),
      "test.png",
    );

    const result = await createProductAction(formData);

    expect(result.success).toBe(true);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    await Promise.resolve();

    expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith("prod-1", {
      images: ["https://res.cloudinary.com/test"],
    });

    createSpy.mockRestore();
    updateSpy.mockRestore();
  });

  test("updateProductAction deletes removed images from Cloudinary in background", async () => {
    const oldProduct = {
      id: "prod-1",
      nameVi: "Old Product",
      slug: "old-product",
      price: "1000",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/old-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/old-2.jpg",
      ],
      isQuoteOnly: false,
    } as unknown as ProductDTO;

    const getByIdSpy = spyOn(productService, "getById").mockResolvedValueOnce(
      oldProduct,
    );
    const updateSpy = spyOn(productService, "update").mockResolvedValueOnce({
      ...oldProduct,
      nameVi: "New",
    });

    const updatePayload = {
      nameVi: "New",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/old-1.jpg"],
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(updatePayload));

    (
      deleteFromCloudinary as unknown as Mock<typeof deleteFromCloudinary>
    ).mockResolvedValueOnce(true);

    const result = await updateProductAction("prod-1", formData);

    expect(result.success).toBe(true);

    await Promise.resolve();

    expect(deleteFromCloudinary).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/image/upload/v1/old-2.jpg",
      "products",
    );

    getByIdSpy.mockRestore();
    updateSpy.mockRestore();
  });
  describe("searchProductsAction()", () => {
    describe("when search query is empty or whitespace", () => {
      test("should return empty list without querying the database", async () => {
        const res = await searchProductsAction("   ");
        expect(res).toEqual({ success: true, data: [] });
      });
    });

    describe("when search query contains model keyword", () => {
      test("should query productService.getAll with keyword and return matching products", async () => {
        const mockProducts: ProductDTO[] = [
          {
            id: "prod-1",
            nameVi: "Máy phát điện Hyundai DHY12500SE",
            nameEn: null,
            slug: "hyundai-dhy12500se",
            price: "70000000.00",
            descriptionVi: null,
            descriptionEn: null,
            shortDescriptionVi: null,
            shortDescriptionEn: null,
            images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
            brandId: "brand-1",
            categoryId: "cat-1",
            specs: {
              model: "DHY12500SE",
              power: 12.5,
              phase: "1phase",
              fuelType: "diesel",
            },
            totalStockCache: 4,
            isQuoteOnly: false,
          },
        ];

        const getAllSpy = spyOn(productService, "getAll").mockResolvedValueOnce(
          {
            data: mockProducts,
            hasMore: false,
            nextCursor: undefined,
            prevCursor: undefined,
          },
        );

        const res = await searchProductsAction("DHY12500SE", 5);

        expect(getAllSpy).toHaveBeenCalledWith(5, { search: "DHY12500SE" });
        expect(res).toEqual({
          success: true,
          data: mockProducts,
        });

        getAllSpy.mockRestore();
      });
    });
  });
});
