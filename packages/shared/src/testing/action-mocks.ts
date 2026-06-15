import { mock, vi } from "bun:test";

export class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

await vi.mock("next/headers", () => ({
  headers: mock(() => new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

await vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: mock(),
    register: mock(),
  },
  userService: {
    checkDuplicateUser: mock(),
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
    approveDealerOrder: mock(),
    verifyManualBankTransfer: mock(),
    approveOrderCancellation: mock(),
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
  assertRole: mock().mockResolvedValue({
    user: {
      id: "admin-1",
      role: "SUPER_ADMIN",
    },
  }),
  AuthError: MockAuthError,
}));

await vi.mock("@/shared/services", () => ({
  uploadToCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
  validateUploadedFile: vi.fn().mockReturnValue({ valid: true }),
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

await vi.mock("@nhatnang/shared", () => ({
  checkRateLimit: mock(() =>
    Promise.resolve({
      success: true,
      remaining: 5,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    }),
  ),
  checkRateLimitWithQueue: mock(() =>
    Promise.resolve({
      success: true,
      remaining: 5,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    }),
  ),
}));
