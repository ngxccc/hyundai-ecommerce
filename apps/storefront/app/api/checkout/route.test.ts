import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  spyOn,
  type Mock,
} from "bun:test";
import {
  mockAuthGetSession,
  mockCheckRateLimitWithQueue,
} from "@nhatnang/shared/testing/action-mocks";
import {
  cartService,
  orderService,
  paymentService,
  type CartService,
  type OrderService,
  type PaymentService,
} from "@nhatnang/database/services";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { POST } from "./route";

describe("POST /api/checkout", () => {
  let getOrCreateCartSpy: Mock<CartService["getOrCreateCart"]>;
  let getCartItemsSpy: Mock<CartService["getCartItems"]>;
  let createOrderSpy: Mock<OrderService["createOrderWithItems"]>;
  let createPaymentSpy: Mock<PaymentService["createPayment"]>;
  let createTxSpy: Mock<PaymentService["createPaymentTransaction"]>;
  let checkoutCreditSpy: Mock<OrderService["checkoutWithTradeCredit"]>;

  beforeEach(() => {
    vi.clearAllMocks();
    getOrCreateCartSpy = spyOn(cartService, "getOrCreateCart");
    getCartItemsSpy = spyOn(cartService, "getCartItems");
    createOrderSpy = spyOn(orderService, "createOrderWithItems");
    createPaymentSpy = spyOn(paymentService, "createPayment");
    createTxSpy = spyOn(paymentService, "createPaymentTransaction");
    checkoutCreditSpy = spyOn(orderService, "checkoutWithTradeCredit");
  });

  afterEach(() => {
    getOrCreateCartSpy.mockRestore();
    getCartItemsSpy.mockRestore();
    createOrderSpy.mockRestore();
    createPaymentSpy.mockRestore();
    createTxSpy.mockRestore();
    checkoutCreditSpy.mockRestore();
  });

  const validBody = {
    shippingAddress: "123 Main St, Hanoi",
    paymentMethod: "PAYOS",
    paymentOption: "DEPOSIT",
    shippingFee: 50000,
  };

  const mockCartProduct = {
    id: "prod-1",
    nameVi: "Generator 2000W",
    nameEn: null,
    slug: "generator-2000w",
    price: "10000000",
    images: [],
    totalStockCache: 10,
  };

  it("returns 429 when rate limit exceeded", async () => {
    mockCheckRateLimitWithQueue.mockResolvedValue({ success: false });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.rateLimitExceeded");
  });

  it("returns 401 when unauthorized", async () => {
    mockAuthGetSession.mockResolvedValue(null);

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.unauthorized");
  });

  it("returns 400 when required fields are missing", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.missingRequiredFields");
  });

  it("returns 400 when cart is empty", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([]);

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.cartEmpty");
  });

  it("creates order and returns mock PayOS checkout URL on success", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    createOrderSpy.mockResolvedValue({ id: "order-123" });
    createPaymentSpy.mockResolvedValue({ id: "payment-123" });
    createTxSpy.mockResolvedValue({ id: "tx-123" });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      data: { orderId: string; checkoutUrl: string };
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.data.orderId).toBe("order-123");
    const isMock = json.data.checkoutUrl.includes("/checkout/mock-payment");
    const isPay = json.data.checkoutUrl.includes("/checkout/pay");
    const isReal = json.data.checkoutUrl.includes("payos.vn");
    expect(isMock || isPay || isReal).toBe(true);
    expect(createOrderSpy).toHaveBeenCalled();
    expect(createPaymentSpy).toHaveBeenCalled();
    expect(createTxSpy).toHaveBeenCalled();
  });

  it("returns 400 when payment method is invalid", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "STRIPE",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.invalidPaymentMethod");
  });

  it("returns 400 when payment option is invalid", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentOption: "INVALID",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.invalidPaymentOption");
  });

  it("returns 400 when cart item has no product", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: null,
      },
    ]);

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.invalidProductInCart");
  });

  it("creates order and returns success redirect URL for CASH on success", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    createOrderSpy.mockResolvedValue({ id: "order-123" });
    createPaymentSpy.mockResolvedValue({ id: "payment-123" });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "CASH",
        paymentOption: "FULL",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      data: { orderId: string; checkoutUrl: string };
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.data.orderId).toBe("order-123");
    expect(json.data.checkoutUrl).toContain(
      "/checkout/success?orderId=order-123",
    );
    expect(createOrderSpy).toHaveBeenCalled();
    expect(createPaymentSpy).toHaveBeenCalledWith({
      orderId: "order-123",
      amount: "22000000",
      method: "CASH",
      status: "PENDING",
    });
  });

  it("returns 500 when createOrderWithItems throws database error", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    createOrderSpy.mockRejectedValue(new Error("Database transaction aborted"));

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.internalServerError");
  });

  it("returns 429 when Trade Credit checkout user lock acquisition fails", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    checkoutCreditSpy.mockRejectedValue(
      new Error("errors.lockAcquisitionFailed"),
    );

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "TRADE_CREDIT",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.lockAcquisitionFailed");
  });

  it("returns 400 when Trade Credit checkout user has insufficient credit limit", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    checkoutCreditSpy.mockRejectedValue(
      new Error("errors.insufficientCreditLimit"),
    );

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "TRADE_CREDIT",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.insufficientCreditLimit");
  });

  it("creates B2B order successfully with Trade Credit and returns redirect URL", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    getOrCreateCartSpy.mockResolvedValue({ id: "cart-123" });
    getCartItemsSpy.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: mockCartProduct,
      },
    ]);

    checkoutCreditSpy.mockResolvedValue({ id: "order-999" });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "TRADE_CREDIT",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      data: { orderId: string; checkoutUrl: string };
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.data.orderId).toBe("order-999");
    expect(json.data.checkoutUrl).toContain(
      "/checkout/success?orderId=order-999",
    );
    expect(checkoutCreditSpy).toHaveBeenCalledWith(
      "user-123",
      expect.objectContaining({
        userId: "user-123",
        paymentMethod: "TRADE_CREDIT",
      }),
      expect.any(Array),
      "cart-123",
    );
  });
});
