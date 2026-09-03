import type { Request } from "express";

export interface ClientMetadata {
  deviceName?: string;
  ipAddress?: string;
}

export function extractClientMetadata(req?: Request): ClientMetadata {
  if (!req) return {};

  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const rawIp =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : typeof realIp === "string"
        ? realIp
        : (req.ip ?? req.socket.remoteAddress);

  const ipAddress =
    typeof rawIp === "string" ? rawIp.substring(0, 45) : undefined;

  const rawUserAgent = req.headers["user-agent"];
  const deviceName =
    typeof rawUserAgent === "string"
      ? rawUserAgent.substring(0, 255)
      : undefined;

  return { deviceName, ipAddress };
}
