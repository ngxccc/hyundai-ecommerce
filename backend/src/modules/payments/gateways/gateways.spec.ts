import { describe, expect, it } from "bun:test";
import { MockPaymentGateway } from "./mock-payment.gateway";
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
});
