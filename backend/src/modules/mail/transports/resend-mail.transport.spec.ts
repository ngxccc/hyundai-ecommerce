import { describe, expect, it, mock } from "bun:test";
import { ResendMailTransport } from "./resend-mail.transport";

describe("ResendMailTransport", () => {
  it("should send email successfully via Resend SDK", async () => {
    const transport = new ResendMailTransport();

    // Mock internal resend.emails.send method
    (transport as unknown as { resend: { emails: { send: unknown } } }).resend =
      {
        emails: {
          send: mock(() =>
            Promise.resolve({
              data: { id: "resend-msg-123" },
              error: null,
            }),
          ),
        },
      };

    const result = await transport.send({
      to: "customer@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    expect(result.id).toBe("resend-msg-123");
  });

  it("should throw when Resend returns API error object", () => {
    const transport = new ResendMailTransport();

    (transport as unknown as { resend: { emails: { send: unknown } } }).resend =
      {
        emails: {
          send: mock(() =>
            Promise.resolve({
              data: null,
              error: {
                message: "Domain not verified",
                name: "validation_error",
              },
            }),
          ),
        },
      };

    expect(
      transport.send({
        to: "customer@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("Domain not verified");
  });
});
