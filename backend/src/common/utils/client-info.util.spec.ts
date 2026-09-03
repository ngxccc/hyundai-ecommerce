import { describe, expect, it } from "bun:test";
import type { Request } from "express";
import { extractClientMetadata } from "./client-info.util";

describe("client-info.util", () => {
  it("extracts ip from x-forwarded-for header if present", () => {
    const req = {
      headers: {
        "x-forwarded-for": "203.0.113.195, 70.41.3.18",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64)",
      },
    } as unknown as Request;

    const result = extractClientMetadata(req);
    expect(result.ipAddress).toBe("203.0.113.195");
    expect(result.deviceName).toBe("Mozilla/5.0 (X11; Linux x86_64)");
  });

  it("extracts ip from x-real-ip header if x-forwarded-for is missing", () => {
    const req = {
      headers: {
        "x-real-ip": "198.51.100.1",
      },
    } as unknown as Request;

    const result = extractClientMetadata(req);
    expect(result.ipAddress).toBe("198.51.100.1");
    expect(result.deviceName).toBeUndefined();
  });

  it("falls back to req.ip if headers are missing", () => {
    const req = {
      headers: {},
      ip: "127.0.0.1",
    } as unknown as Request;

    const result = extractClientMetadata(req);
    expect(result.ipAddress).toBe("127.0.0.1");
  });
});
