import { describe, expect, it, mock } from "bun:test";
import { MockPaymentGateway } from "./mock-payment.gateway";
import { PayOSGateway } from "./payos.gateway";
import { buildPayOSCheckoutUrl } from "../constants/payment.constant";

describe("Payment Gateways", () => {
  describe("MockPaymentGateway", () => {
    it("should generate simulated payment link with valid URLs and QR code", async () => {
      const gateway = new MockPaymentGateway();
      const result = await gateway.createPaymentLink({
        orderCode: 123456789,
        amount: 5000000,
        description: "ORD-12345678",
        cancelUrl: "http://localhost:3000/cancel",
        returnUrl: "http://localhost:3000/success",
      });

      expect(result.checkoutUrl).toBe(buildPayOSCheckoutUrl(123456789));
      expect(result.qrCode).toContain("123456789");
      expect(result.paymentLinkId).toBe("plink_123456789");
    });
  });
  describe("PayOSGateway", () => {
    it("should call PayOS API and return payment link details when API responds successfully", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              code: "00",
              desc: "Success",
              data: {
                checkoutUrl: "https://pay.payos.vn/web/123456789",
                qrCode: "vietqr-payload",
                paymentLinkId: "plink-123456789",
              },
            }),
            { status: 200 },
          ),
        ),
      ) as unknown as typeof fetch;

      try {
        const gateway = new PayOSGateway();
        const result = await gateway.createPaymentLink({
          orderCode: 123456789,
          amount: 5000000,
          description: "ORD-12345678",
          cancelUrl: "http://localhost:3000/cancel",
          returnUrl: "http://localhost:3000/success",
        });

        expect(result.checkoutUrl).toBe("https://pay.payos.vn/web/123456789");
        expect(result.qrCode).toBe("vietqr-payload");
        expect(result.paymentLinkId).toBe("plink-123456789");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should throw error when PayOS API responds with non-zero error code", () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              code: "21",
              desc: "Invalid merchant credentials",
            }),
            { status: 200 },
          ),
        ),
      ) as unknown as typeof fetch;

      try {
        const gateway = new PayOSGateway();
        expect(
          gateway.createPaymentLink({
            orderCode: 123456789,
            amount: 5000000,
            description: "ORD-12345678",
            cancelUrl: "http://localhost:3000/cancel",
            returnUrl: "http://localhost:3000/success",
          }),
        ).rejects.toThrow("PayOS Gateway Error: Invalid merchant credentials");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
