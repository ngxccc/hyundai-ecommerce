import { describe, expect, it, mock, afterEach } from "bun:test";
import { rotateAdminToken } from "./token-refresh";

describe("rotateAdminToken", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should return null if refreshToken is empty or whitespace", async () => {
    const result1 = await rotateAdminToken("");
    const result2 = await rotateAdminToken("   ");
    const result3 = await rotateAdminToken(null);
    const result4 = await rotateAdminToken(undefined);

    expect(result1).toBeNull();
    expect(result2).toBeNull();
    expect(result3).toBeNull();
    expect(result4).toBeNull();
  });

  it("should call POST /api/v1/auth/refresh and return rotated token pair on success", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    globalThis.fetch = mock(
      (url: string | URL | Request, init?: RequestInit) => {
        capturedUrl =
          typeof url === "string"
            ? url
            : url instanceof URL
              ? url.href
              : url.url;
        capturedBody = typeof init?.body === "string" ? init.body : "";
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                accessToken: "new-access-token-jwt",
                refreshToken: "new-refresh-token-uuid",
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      },
    ) as unknown as typeof fetch;

    const result = await rotateAdminToken("valid-old-refresh-token");

    expect(capturedUrl).toContain("/api/v1/auth/refresh");
    expect(capturedBody).toBe(
      JSON.stringify({ refreshToken: "valid-old-refresh-token" }),
    );
    expect(result).not.toBeNull();
    expect(result?.accessToken).toBe("new-access-token-jwt");
    expect(result?.refreshToken).toBe("new-refresh-token-uuid");
  });

  it("should return null if backend returns 401 Unauthorized", async () => {
    globalThis.fetch = mock(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            success: false,
            error: "Invalid or expired refresh token",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      );
    }) as unknown as typeof fetch;

    const result = await rotateAdminToken("expired-refresh-token");
    expect(result).toBeNull();
  });
});
