import { mock, vi } from "bun:test";

export class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

void vi.mock("next/headers", () => ({
  headers: mock(() => new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

void vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: mock(),
  },
  productService: {
    create: mock(),
    update: mock(),
    delete: mock(),
    getById: mock(),
  },
  quotesService: {
    approveAndConvertToOrder: mock(),
    getComplexQuote: mock(),
    updateQuoteItemPrice: mock(),
    addQuoteMessage: mock(),
    updateQuoteStatus: mock(),
  },
  orderService: {
    updateOrderStatus: mock(),
    selectWinningBid: mock(),
  },
}));

await vi.mock("next/cache", () => ({
  revalidatePath: mock(),
}));

await vi.mock("@/shared/lib/action-auth", () => ({
  requireAuth: mock().mockResolvedValue({
    user: {
      id: "admin-1",
      role: "admin",
    },
  }),
  AuthError: MockAuthError,
}));

await vi.mock("@/shared/services", () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

await vi.mock("next-intl/server", () => ({
  getTranslations: mock().mockResolvedValue((key: string) => key),
}));

await vi.mock("next/server", () => ({
  after: mock((cb: () => void) => {
    // Execute immediately for testing but let it run asynchronously
    void cb();
  }),
}));
