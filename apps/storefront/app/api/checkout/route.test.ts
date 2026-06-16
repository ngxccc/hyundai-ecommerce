import { describe, expect, it, vi, beforeEach } from "bun:test";
import {
  mockAuthGetSession,
  mockCartGetOrCreateCart,
  mockCartGetCartItems,
  mockOrderCreateOrderWithItems,
  mockOrderCreatePayment,
  mockCheckRateLimitWithQueue,
} from "@nhatnang/shared/testing/action-mocks";
import { HTTP_STATUS } from "@nhatnang/shared/constants";

// Static import cannot work here because we must register mock.module first before importing the route handler.
const { POST } = await import("./route");
describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    shippingAddress: "123 Main St, Hanoi",
    paymentMethod: "PAYOS",
    paymentOption: "DEPOSIT",
    shippingFee: 50000,
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
      body: JSON.stringify({ shippingAddress: "" }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.missingRequiredFields");
  });

  it("returns 400 when cart is empty", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    mockCartGetOrCreateCart.mockResolvedValue({ id: "cart-123" });
    mockCartGetCartItems.mockResolvedValue([]);

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
    mockCartGetOrCreateCart.mockResolvedValue({ id: "cart-123" });
    mockCartGetCartItems.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: {
          id: "prod-1",
          nameVi: "Generator 2000W",
          slug: "generator-2000w",
          price: "10000000",
        },
      },
    ]);

    mockOrderCreateOrderWithItems.mockResolvedValue({ id: "order-123" });
    mockOrderCreatePayment.mockResolvedValue({ id: "payment-123" });

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
    const isReal = json.data.checkoutUrl.includes("payos.vn");
    expect(isMock || isReal).toBe(true);
    expect(mockOrderCreateOrderWithItems).toHaveBeenCalled();
    expect(mockOrderCreatePayment).toHaveBeenCalled();
  });

  it("returns 400 when payment method is invalid", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "STRIPE", // invalid
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
        paymentOption: "INVALID", // invalid
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
    mockCartGetOrCreateCart.mockResolvedValue({ id: "cart-123" });
    mockCartGetCartItems.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: null, // missing product (e.g. hard deleted)
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

  it("creates order and returns success redirect URL for MANUAL_TRANSFER on success", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    mockCartGetOrCreateCart.mockResolvedValue({ id: "cart-123" });
    mockCartGetCartItems.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: {
          id: "prod-1",
          nameVi: "Generator 2000W",
          slug: "generator-2000w",
          price: "10000000",
        },
      },
    ]);

    mockOrderCreateOrderWithItems.mockResolvedValue({ id: "order-123" });
    mockOrderCreatePayment.mockResolvedValue({ id: "payment-123" });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        paymentMethod: "MANUAL_TRANSFER",
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
    expect(mockOrderCreateOrderWithItems).toHaveBeenCalled();
    expect(mockOrderCreatePayment).toHaveBeenCalledWith({
      orderId: "order-123",
      amount: "4400000",
      method: "MANUAL_TRANSFER",
      status: "PENDING",
      transactionId: "order-123",
    });
  });

  it("returns 500 when createOrderWithItems throws database error", async () => {
    mockAuthGetSession.mockResolvedValue({ user: { id: "user-123" } });
    mockCartGetOrCreateCart.mockResolvedValue({ id: "cart-123" });
    mockCartGetCartItems.mockResolvedValue([
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        product: {
          id: "prod-1",
          nameVi: "Generator 2000W",
          slug: "generator-2000w",
          price: "10000000",
        },
      },
    ]);

    mockOrderCreateOrderWithItems.mockRejectedValue(
      new Error("Database transaction aborted"),
    );

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
});
