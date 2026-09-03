import { describe, it, expect, beforeEach, mock } from "bun:test";
import { createHmac } from "node:crypto";
import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { I18nService } from "nestjs-i18n";
import { sortAndFormatPayloadData } from "@/common/utils/payos-crypto.util";
import { PayOSWebhookController } from "./payos-webhook.controller";
import type { PayOSWebhookDto } from "./dto/payos-webhook.dto";

type MockFn = ReturnType<typeof mock>;

describe("PayOSWebhookController", () => {
  let controller: PayOSWebhookController;
  let mockGet: MockFn;

  beforeEach(() => {
    mockGet = mock((key: string) => {
      if (key === "PAYOS_CHECKSUM_KEY") return "test_checksum_key_12345";
      return undefined;
    });

    const mockConfigService = { get: mockGet };
    const mockI18n = {
      t: (key: string) => key,
    };

    controller = new PayOSWebhookController(
      mockConfigService as unknown as ConfigService,
      mockI18n as unknown as I18nService,
    );
  });
  const validData = {
    orderCode: 123456,
    amount: 150000,
    description: "Test payment",
    accountNumber: "123456789",
    reference: "REF-001",
    transactionDateTime: new Date().toISOString(),
    currency: "VND",
    paymentLinkId: "LINK-001",
    code: "00",
    desc: "success",
  };

  const validPayload = {
    code: "00",
    desc: "success",
    data: validData,
    signature: "invalid_sig",
  };
  it("should throw BadRequestException on invalid HMAC signature (INV-6)", () => {
    expect(() => controller.handlePayOSWebhook(validPayload)).toThrow(
      BadRequestException,
    );
  });

  it("should throw BadRequestException on missing or empty signature (INV-6)", () => {
    const emptySigPayload: PayOSWebhookDto = {
      ...validPayload,
      signature: "",
    };

    expect(() => controller.handlePayOSWebhook(emptySigPayload)).toThrow(
      BadRequestException,
    );
  });

  it("should throw BadRequestException if timestamp skew exceeds 5 minutes (INV-6)", () => {
    const stalePayload: PayOSWebhookDto = {
      ...validPayload,
      data: {
        ...validData,
        transactionDateTime: "2020-01-01 00:00:00",
      },
    };

    expect(() => controller.handlePayOSWebhook(stalePayload)).toThrow(
      BadRequestException,
    );
  });

  it("should throw BadRequestException if transactionDateTime is missing (INV-6)", () => {
    const missingTimePayload: PayOSWebhookDto = {
      ...validPayload,
      data: {
        ...validData,
        transactionDateTime: "",
      },
    };

    expect(() => controller.handlePayOSWebhook(missingTimePayload)).toThrow(
      BadRequestException,
    );
  });

  it("should accept valid payload with valid signature and fresh timestamp (INV-6)", () => {
    const formattedData = sortAndFormatPayloadData(validData);
    const validSignature = createHmac("sha256", "test_checksum_key_12345")
      .update(formattedData)
      .digest("hex");

    const freshPayload: PayOSWebhookDto = {
      ...validPayload,
      signature: validSignature,
    };

    const response = controller.handlePayOSWebhook(freshPayload);
    expect(response).toEqual({
      success: true,
      message: "Webhook processed successfully",
    });
  });
});
