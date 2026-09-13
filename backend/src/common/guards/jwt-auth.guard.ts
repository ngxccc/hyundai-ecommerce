import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator";
import { env } from "@/env";
import type { Request } from "express";
import type { JwtPayload } from "@/common/decorators/current-user.decorator";
import { I18nContext } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.throwUnauthorized();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: env.JWT_SECRET,
      });
      request.user = payload;
    } catch {
      this.throwUnauthorized();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private throwUnauthorized(): never {
    const i18n = I18nContext.current<I18nTranslations>()?.service;
    const lang = I18nContext.current()?.lang;

    const message = i18n
      ? i18n.t("auth.TOKEN_INVALID_OR_EXPIRED", { lang })
      : "Unauthorized";

    throw new UnauthorizedException(message);
  }
}
