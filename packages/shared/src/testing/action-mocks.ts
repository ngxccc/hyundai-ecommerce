import { beforeEach, mock, vi } from "bun:test";

export class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const mockAuthLoginEmail = mock();
export const mockAuthRegister = mock();

export const mockUserCheckDuplicateUser = mock();

export const mockProductCreate = mock();
export const mockProductUpdate = mock();
export const mockProductDelete = mock();
export const mockProductGetById = mock();

export const mockQuotesApproveAndConvertToOrder = mock();
export const mockQuotesGetComplexQuote = mock();
export const mockQuotesUpdateQuoteItemPrice = mock();
export const mockQuotesAddQuoteMessage = mock();
export const mockQuotesUpdateQuoteStatus = mock();

export const mockCartGetOrCreateCart = mock();
export const mockCartGetCartItems = mock();

export const mockOrderUpdateOrderStatus = mock();
export const mockOrderSelectWinningBid = mock();
export const mockOrderApproveDealerOrder = mock();
export const mockOrderVerifyManualBankTransfer = mock();
export const mockOrderApproveOrderCancellation = mock();
export const mockOrderCreateOrderWithItems = mock();
export const mockOrderCreatePayment = mock();
export const mockOrderGetPaymentByTransactionId = mock();
export const mockOrderUpdatePayment = mock();
export const mockConfirmPayOSPayment = mock();
export const mockOrderCheckoutWithTradeCredit = mock();

export const mockAuthGetSession = mock();
export const mockCheckRateLimit = mock();
export const mockCheckRateLimitWithQueue = mock();

await vi.mock("next/headers", () => ({
  headers: mock(() => new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

await vi.mock("@nhatnang/database/services", () => ({
  authService: {
    loginEmail: mockAuthLoginEmail,
    register: mockAuthRegister,
  },
  userService: {
    checkDuplicateUser: mockUserCheckDuplicateUser,
  },
  productService: {
    create: mockProductCreate,
    update: mockProductUpdate,
    delete: mockProductDelete,
    getById: mockProductGetById,
  },
  quotesService: {
    approveAndConvertToOrder: mockQuotesApproveAndConvertToOrder,
    getComplexQuote: mockQuotesGetComplexQuote,
    updateQuoteItemPrice: mockQuotesUpdateQuoteItemPrice,
    addQuoteMessage: mockQuotesAddQuoteMessage,
    updateQuoteStatus: mockQuotesUpdateQuoteStatus,
  },
  cartService: {
    getOrCreateCart: mockCartGetOrCreateCart,
    getCartItems: mockCartGetCartItems,
  },
  orderService: {
    updateOrderStatus: mockOrderUpdateOrderStatus,
    selectWinningBid: mockOrderSelectWinningBid,
    approveDealerOrder: mockOrderApproveDealerOrder,
    verifyManualBankTransfer: mockOrderVerifyManualBankTransfer,
    approveOrderCancellation: mockOrderApproveOrderCancellation,
    createOrderWithItems: mockOrderCreateOrderWithItems,
    createPayment: mockOrderCreatePayment,
    getPaymentByTransactionId: mockOrderGetPaymentByTransactionId,
    updatePayment: mockOrderUpdatePayment,
    confirmPayOSPayment: mockConfirmPayOSPayment,
    checkoutWithTradeCredit: mockOrderCheckoutWithTradeCredit,
  },
}));

await vi.mock("@nhatnang/database/auth", () => ({
  auth: {
    api: {
      getSession: mockAuthGetSession,
    },
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
  assertFinanceRole: mock().mockResolvedValue({
    user: {
      id: "admin-1",
      role: "SUPER_ADMIN",
    },
  }),
  assertSalesOrFinanceRole: mock().mockResolvedValue({
    user: {
      id: "admin-1",
      role: "SUPER_ADMIN",
    },
  }),
  assertWarehouseRole: mock().mockResolvedValue({
    user: {
      id: "admin-1",
      role: "SUPER_ADMIN",
    },
  }),
  AuthError: MockAuthError,
}));

await vi.mock("next-intl/server", () => ({
  getTranslations: mock().mockResolvedValue((key: string) => key),
}));

class MockNextResponse extends Response {
  static override json(body: any, init?: ResponseInit) {
    return new Response(JSON.stringify(body), init);
  }
}

await vi.mock("next/server", () => ({
  NextResponse: MockNextResponse,
  after: mock((cb: () => void) => {
    // Execute immediately for testing but let it run asynchronously
    void cb();
  }),
}));

await vi.mock("@nhatnang/shared", () => ({
  checkRateLimit: mockCheckRateLimit,
  checkRateLimitWithQueue: mockCheckRateLimitWithQueue,
}));

await mock.module("@nhatnang/database/auth", () => ({
  auth: {
    api: {
      getSession: mockAuthGetSession,
    },
  },
}));

beforeEach(() => {
  mockAuthLoginEmail.mockReset();
  mockAuthRegister.mockReset();
  mockUserCheckDuplicateUser.mockReset();
  mockProductCreate.mockReset();
  mockProductUpdate.mockReset();
  mockProductDelete.mockReset();
  mockProductGetById.mockReset();
  mockQuotesApproveAndConvertToOrder.mockReset();
  mockQuotesGetComplexQuote.mockReset();
  mockQuotesUpdateQuoteItemPrice.mockReset();
  mockQuotesAddQuoteMessage.mockReset();
  mockQuotesUpdateQuoteStatus.mockReset();
  mockCartGetOrCreateCart.mockReset();
  mockCartGetCartItems.mockReset();
  mockOrderUpdateOrderStatus.mockReset();
  mockOrderSelectWinningBid.mockReset();
  mockOrderApproveDealerOrder.mockReset();
  mockOrderVerifyManualBankTransfer.mockReset();
  mockOrderApproveOrderCancellation.mockReset();
  mockOrderCreateOrderWithItems.mockReset();
  mockOrderCreatePayment.mockReset();
  mockOrderGetPaymentByTransactionId.mockReset();
  mockOrderUpdatePayment.mockReset();
  mockConfirmPayOSPayment.mockReset();
  mockOrderCheckoutWithTradeCredit.mockReset();
  mockAuthGetSession.mockReset();
  mockCheckRateLimit.mockReset();
  mockCheckRateLimitWithQueue.mockReset();

  // Setup default return values for rate limiters so they pass by default
  mockCheckRateLimit.mockResolvedValue({
    success: true,
    remaining: 5,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  });
  mockCheckRateLimitWithQueue.mockResolvedValue({
    success: true,
    remaining: 5,
    reset: Date.now() + 60000,
    pending: Promise.resolve(),
  });
});
