import {
  expect,
  test,
  describe,
  mock,
  vi,
  beforeEach,
  type Mock,
} from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { ProductService } from "@nhatnang/database/services";

void vi.mock("next/server", () => ({
  after: mock((cb: () => void) => {
    // Execute immediately for testing but let it run asynchronously
    void cb();
  }),
}));

void vi.mock("next/cache", () => ({
  revalidatePath: mock(),
}));

class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

void vi.mock("@/shared/lib/action-auth", () => ({
  requireAuth: mock().mockResolvedValue({}),
  AuthError: MockAuthError,
}));

void vi.mock("@nhatnang/database/services", () => ({
  productService: {
    create: mock(),
    update: mock(),
    delete: mock(),
  },
}));

void vi.mock("@/shared/services", () => ({
  uploadToCloudinary: mock(),
}));

void vi.mock("next-intl/server", () => ({
  getTranslations: mock().mockResolvedValue((key: string) => key),
}));

import type { TProduct } from "@nhatnang/database/schemas";
import type { TCreateProductInput } from "@nhatnang/database/validators";

describe("product.actions", () => {
  let createMock: Mock<ProductService["create"]>;
  let updateMock: Mock<ProductService["update"]>;

  beforeEach(async () => {
    const { productService } = await import("@nhatnang/database/services");
    const { uploadToCloudinary } = await import("@/shared/services");
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

    const mockProduct: TProduct = {
      id: "prod-1",
      name: "Test Product",
      slug: "test",
      price: "1000",
      description: null,
      shortDescription: null,
      images: [],
      brandId: null,
      categoryId: null,
      specs: {},
      totalStockCache: 0,
      isQuoteOnly: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    createMock.mockResolvedValueOnce(mockProduct);
    (
      uploadToCloudinary as unknown as Mock<typeof uploadToCloudinary>
    ).mockResolvedValue("https://res.cloudinary.com/test");

    const validData: TCreateProductInput = {
      name: "Test Product",
      slug: "test-product",
      price: "1000",
      description: null,
      shortDescription: null,
      images: [],
      isQuoteOnly: false,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(validData));
    formData.append("images", new Blob(["test"], { type: "image/png" }), "test.png");

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
});
