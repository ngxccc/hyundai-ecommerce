import crypto from "node:crypto";
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { env } from "@/env";
import type { JwtPayload } from "@/common/decorators/current-user.decorator";

/**
 * Guard that allows operational cron execution if:
 * 1. An 'x-cron-secret' header matches configured env.CRON_SECRET, OR
 * 2. An authenticated user carries ADMIN role.
 */
@Injectable()
export class CronAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    // Check header secret
    const cronHeader = request.headers["x-cron-secret"];
    if (env.CRON_SECRET && typeof cronHeader === "string") {
      const headerBuf = Buffer.from(cronHeader);
      const secretBuf = Buffer.from(env.CRON_SECRET);
      // Constant-time comparison defends against timing-attack side channels
      if (
        headerBuf.length === secretBuf.length &&
        crypto.timingSafeEqual(headerBuf, secretBuf)
      ) {
        return true;
      }
    }

    // Check if user is authenticated admin
    if (request.user?.role === "ADMIN") {
      return true;
    }

    throw new UnauthorizedException(
      "Invalid cron authorization secret or credentials",
    );
  }
}
