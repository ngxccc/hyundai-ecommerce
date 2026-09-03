import { MailService } from "./mail.service";
import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { env } from "@/env";

// Mock the resend module globally using Bun's native mock.module wrapper.
const mockSend = mock(() =>
  Promise.resolve<{
    data: { id: string } | null;
    error: { name: string; message: string } | null;
  }>({
    data: { id: "mock-email-id-123" },
    error: null,
  }),
);

await mock.module("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("MailService", () => {
  let service: MailService;

  beforeEach(() => {
    mockSend.mockClear();
    service = new MailService();
    spyOn(
      (service as unknown as { logger: { error: () => void } }).logger,
      "error",
    ).mockImplementation(() => undefined);
  });

  describe("when initializing mail module", () => {
    it("should instantiate MailService correctly", () => {
      expect(service).toBeDefined();
    });
  });

  describe("when sending verification email", () => {
    it("should bypass sending email when recipient belongs to test domain @example.com in non-production", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "test";

      await service.sendVerificationEmail(
        "user@example.com",
        "Test User",
        "token-123",
      );

      expect(mockSend).not.toHaveBeenCalled();
      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should call resend.emails.send with verification link when email is valid", async () => {
      await service.sendVerificationEmail(
        "user@ticketbooking.vn",
        "Test User",
        "token-xyz",
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@ticketbooking.vn",
          subject: "Xác thực tài khoản của bạn",
          html: expect.stringContaining("token-xyz") as unknown as string,
        }),
      );
    });

    it("should throw error and log failure when resend api returns an error", async () => {
      mockSend.mockImplementationOnce(() =>
        Promise.resolve({
          data: null,
          error: { name: "Error", message: "API Error" },
        }),
      );

      let thrown = false;
      try {
        await service.sendVerificationEmail(
          "user@ticketbooking.vn",
          "Test User",
          "token-xyz",
        );
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("API Error");
      }
      expect(thrown).toBe(true);
    });
  });

  describe("when sending password reset email", () => {
    it("should bypass sending email when recipient belongs to test domain @example.com in non-production", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "test";

      await service.sendPasswordResetEmail(
        "user@example.com",
        "Test User",
        "token-123",
      );

      expect(mockSend).not.toHaveBeenCalled();
      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should call resend.emails.send with password reset link when email is valid", async () => {
      await service.sendPasswordResetEmail(
        "user@ticketbooking.vn",
        "Test User",
        "token-reset-xyz",
      );

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@ticketbooking.vn",
          subject: "Khôi phục mật khẩu của bạn",
          html: expect.stringContaining("token-reset-xyz") as unknown as string,
        }),
      );
    });

    it("should throw error and log failure when resend api returns an error", async () => {
      mockSend.mockImplementationOnce(() =>
        Promise.resolve({
          data: null,
          error: { name: "Error", message: "Reset API Error" },
        }),
      );

      let thrown = false;
      try {
        await service.sendPasswordResetEmail(
          "user@ticketbooking.vn",
          "Test User",
          "token-reset-xyz",
        );
      } catch (err) {
        thrown = true;
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Reset API Error");
      }
      expect(thrown).toBe(true);
    });
  });
});
