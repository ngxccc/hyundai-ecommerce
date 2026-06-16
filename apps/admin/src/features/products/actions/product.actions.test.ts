import {
  expect,
  test,
  describe,
  beforeEach,
  vi,
  mock,
  type Mock,
} from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { ProductService } from "@nhatnang/database/services";
import type { ProductDTO } from "@nhatnang/database/dtos";
import type { TCreateProductInput } from "@nhatnang/database/validators";
import "@nhatnang/shared/testing/action-mocks";

await vi.mock("@/shared/services", () => ({
  uploadToCloudinary: mock().mockResolvedValue(
    "http://cloudinary.com/mock-image.png",
  ),
  deleteFromCloudinary: mock().mockResolvedValue(true),
  validateUploadedFile: mock().mockReturnValue({ valid: true }),
}));

describe("product.actions", () => {
  let createMock: Mock<ProductService["create"]>;
  let updateMock: Mock<ProductService["update"]>;

  beforeEach(async () => {
    const { productService } = await import("@nhatnang/database/services");
    const { uploadToCloudinary, deleteFromCloudinary } =
      await import("@/shared/services");
    const { after } = await import("next/server");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    createMock = productService.create as Mock<typeof productService.create>;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    updateMock = productService.update as Mock<typeof productService.update>;

    createMock.mockClear();
    updateMock.mockClear();
    (
      uploadToCloudinary as unknown as Mock<typeof uploadToCloudinary>
    ).mockClear();
    (
      deleteFromCloudinary as unknown as Mock<typeof deleteFromCloudinary>
    ).mockClear();
    (after as unknown as Mock<typeof after>).mockClear();
  });

  test("createProductAction returns validation error for empty input", async () => {
    const { createProductAction } = await import("./product.actions");

    const formData = new FormData();
    formData.append("payload", "{}");

    const result = await createProductAction(formData);

    expect(result.success).toBe(false);
    expect(result.success === false && result.code).toBe(
      SYSTEM_ERROR_CODES.VALIDATION_ERROR,
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  test("createProductAction saves product and triggers background upload", async () => {
    const { createProductAction } = await import("./product.actions");
    const { uploadToCloudinary } = await import("@/shared/services");
    const { after } = await import("next/server");

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

    createMock.mockResolvedValueOnce(mockProduct);
    (
      uploadToCloudinary as unknown as Mock<typeof uploadToCloudinary>
    ).mockResolvedValue("https://res.cloudinary.com/test");

    const validData: TCreateProductInput = {
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
    expect(createMock).toHaveBeenCalledTimes(1);

    // Background execution check
    expect(after).toHaveBeenCalledTimes(1);

    // wait a tick for background async logic inside mock
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith("prod-1", {
      images: ["https://res.cloudinary.com/test"],
    });
  });

  test("updateProductAction deletes removed images from Cloudinary in background", async () => {
    const { updateProductAction } = await import("./product.actions");

    const oldProduct = {
      id: "prod-1",
      name: "Old Product",
      slug: "old-product",
      price: "1000",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/old-1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/old-2.jpg",
      ],
      isQuoteOnly: false,
    };

    const { productService } = await import("@nhatnang/database/services");

    (
      productService.getById as Mock<typeof productService.getById>
    ).mockResolvedValueOnce(oldProduct as unknown as ProductDTO);
    (
      productService.update as Mock<typeof productService.update>
    ).mockResolvedValueOnce({
      ...oldProduct,
      nameVi: "New",
    } as unknown as ProductDTO);

    const updatePayload = {
      nameVi: "New",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/old-1.jpg"], // removed old-2.jpg
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(updatePayload));
    // No new images to upload

    const { deleteFromCloudinary } = await import("@/shared/services");

    (deleteFromCloudinary as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      true,
    );

    const result = await updateProductAction("prod-1", formData);

    expect(result.success).toBe(true);

    // Wait for microtasks to finish (after hook execution)
    await Promise.resolve();

    expect(deleteFromCloudinary).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/image/upload/v1/old-2.jpg",
      "products",
    );
  });
});
