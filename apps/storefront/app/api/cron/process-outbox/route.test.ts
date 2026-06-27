import { describe, expect, it, vi, beforeEach, mock } from "bun:test";
import type { Mock } from "bun:test";
import {
  mockOrderFetchPendingOutboxEvents,
  mockOrderUpdateOutboxEventStatus,
  mockResendSend,
} from "@nhatnang/shared/testing/action-mocks";
import type { OrderService } from "@nhatnang/database/services";
import { HTTP_STATUS } from "@nhatnang/shared/constants";

// Mock database env
await mock.module("@nhatnang/database", () => ({
  env: {
    RESEND_API_KEY: "test-resend-key",
    EMAIL_FROM: "Hyundai Nhat Nang <onboarding@resend.dev>",
  },
}));

// Mock app env to bypass t3-env validation
await mock.module("@/env", () => ({
  env: {
    CRON_SECRET: "test-cron-secret",
    TELEGRAM_BOT_TOKEN: "test-bot-token",
    TELEGRAM_ADMIN_CHAT_ID: "test-chat-id",
  },
}));

// Mock global fetch for Telegram
const mockFetch = mock();
globalThis.fetch = mockFetch as unknown as typeof fetch;

// Static import cannot work here because Bun's async mock.module must run before importing the route handler.
const { POST } = await import("./route");

describe("POST /api/cron/process-outbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockClear();
  });

  it("returns 401 when Authorization header is missing or incorrect", async () => {
    const request = new Request("http://localhost/api/cron/process-outbox", {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Unauthorized");
  });

  it("successfully processes outbox events", async () => {
    // Mock the database service functions
    (
      mockOrderFetchPendingOutboxEvents as unknown as Mock<
        OrderService["fetchPendingOutboxEvents"]
      >
    ).mockResolvedValueOnce([
      {
        id: "event-1",
        eventType: "SEND_MAIL",
        payload: {
          to: "test@example.com",
          subject: "Test Mail",
          body: "Hello",
        },
        retryCount: 0,
      },
      {
        id: "event-2",
        eventType: "SEND_TELEGRAM_ALERT",
        payload: { message: "Test alert" },
        retryCount: 0,
      },
    ]);

    (
      mockOrderUpdateOutboxEventStatus as unknown as Mock<
        OrderService["updateOutboxEventStatus"]
      >
    ).mockResolvedValue(undefined);
    (
      mockResendSend as unknown as Mock<
        (...args: unknown[]) => Promise<unknown>
      >
    ).mockResolvedValue({ id: "mail-id" });
    mockFetch.mockResolvedValue({ ok: true });

    // Set process.env variables
    process.env["TELEGRAM_BOT_TOKEN"] = "test-bot-token";
    process.env["TELEGRAM_ADMIN_CHAT_ID"] = "test-chat-id";

    // Static import cannot work here because env validation runs at module execution.
    const { env: appEnv } = await import("@/env");

    const request = new Request("http://localhost/api/cron/process-outbox", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appEnv.CRON_SECRET}`,
      },
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      processedCount: number;
      results: unknown[];
    };

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.processedCount).toBe(2);
    expect(mockResendSend).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockOrderFetchPendingOutboxEvents).toHaveBeenCalledWith(10);
    expect(mockOrderUpdateOutboxEventStatus).toHaveBeenCalledTimes(2);
  });
});
