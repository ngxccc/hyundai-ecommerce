import { MailService } from "./mail.service";
import { beforeEach, describe, expect, it, mock, type Mock } from "bun:test";
import type { MailTransport } from "./interfaces/mail-transport.interface";
import { LogMailTransport } from "./transports/log-mail.transport";

describe("MailService", () => {
  let service: MailService;
  let mockTransport: MailTransport;
  let sendMock: Mock<MailTransport["send"]>;

  beforeEach(() => {
    sendMock = mock(() => Promise.resolve({ id: "mock-email-id-123" }));
    mockTransport = {
      send: sendMock,
    };
    service = new MailService(mockTransport);
  });

  describe("when initializing mail module", () => {
    it("should instantiate MailService correctly", () => {
      expect(service).toBeDefined();
    });
  });

  describe("when sending verification email", () => {
    it("should call transport.send with verification link and recipient details", async () => {
      await service.sendVerificationEmail(
        "user@hyundainhatnang.vn",
        "Nguyễn Văn An",
        "token-uuid-123",
      );

      expect(sendMock).toHaveBeenCalledTimes(1);
      const call = sendMock.mock.calls[0]?.[0];
      expect(call?.to).toBe("user@hyundainhatnang.vn");
      expect(call?.subject).toBe("Xác thực tài khoản của bạn");
      expect(call?.html).toContain("verify-email?token=token-uuid-123");
    });

    it("should propagate errors when transport fails", () => {
      sendMock.mockImplementationOnce(() =>
        Promise.reject(new Error("SMTP Connection Failed")),
      );

      expect(
        service.sendVerificationEmail(
          "user@hyundainhatnang.vn",
          "Test User",
          "token-fail",
        ),
      ).rejects.toThrow("SMTP Connection Failed");
    });
  });

  describe("when sending password reset email", () => {
    it("should call transport.send with reset link and recipient details", async () => {
      await service.sendPasswordResetEmail(
        "user@hyundainhatnang.vn",
        "Trần Thị Bình",
        "reset-token-456",
      );

      expect(sendMock).toHaveBeenCalledTimes(1);
      const call = sendMock.mock.calls[0]?.[0];
      expect(call?.to).toBe("user@hyundainhatnang.vn");
      expect(call?.subject).toBe("Khôi phục mật khẩu của bạn");
      expect(call?.html).toContain("reset-password?token=reset-token-456");
    });

    it("should propagate errors when transport fails", () => {
      sendMock.mockImplementationOnce(() =>
        Promise.reject(new Error("Quota Exceeded")),
      );

      expect(
        service.sendPasswordResetEmail(
          "user@hyundainhatnang.vn",
          "Test User",
          "token-fail",
        ),
      ).rejects.toThrow("Quota Exceeded");
    });
  });

  describe("LogMailTransport", () => {
    it("should simulate delivery and return log id without error", async () => {
      const logTransport = new LogMailTransport();
      const result = await logTransport.send({
        to: "test@example.com",
        subject: "Hello",
        html: "<p>World</p>",
      });

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^log-\d+/);
    });
  });
});
