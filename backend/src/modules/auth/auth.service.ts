import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  LoginDto,
  LoginResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
  ChangePasswordDto,
} from "./dto";
import { refreshTokens, users, outboxEvents } from "@/database/schemas";
import { OUTBOX_EVENT_TYPE } from "@/common/constants/event.constant";
import { PG_ERROR_CODE } from "@/common/constants/error.constant";
import { isPostgresErrorCode } from "@/common/utils/error.util";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import type { ClientMetadata } from "@/common/utils/client-info.util";
import {
  comparePassword,
  hashPassword,
  sha256,
} from "@/common/utils/crypto.util";
import { randomBytes } from "node:crypto";
import { getExpiryDate } from "@/common/utils/date.util";
import { I18nContext, I18nService } from "nestjs-i18n";
import type { I18nTranslations, I18nPath } from "@/generated/i18n.generated";
import { JwtService } from "@nestjs/jwt";
import { env } from "@/env";
@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly jwtService: JwtService,
  ) {}

  private throwException(
    key: I18nPath,
    Exception: new (message: string) => Error = BadRequestException,
  ): never {
    throw new Exception(
      this.i18n.t(key, {
        lang: I18nContext.current()?.lang,
      }),
    );
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(32).toString("hex");
    return { accessToken, refreshToken };
  }

  private async createTokenSession(
    userId: string,
    email: string,
    role: string,
    metadata?: ClientMetadata,
  ) {
    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      email,
      role,
    );
    const tokenHash = sha256(refreshToken);
    const expiresAt = getExpiryDate(env.JWT_REFRESH_EXPIRES_IN || "7d");
    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
      deviceName: metadata?.deviceName,
      ipAddress: metadata?.ipAddress,
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto): Promise<void> {
    const [existingUser] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException(
        this.i18n.t("auth.EMAIL_ALREADY_EXISTS", {
          lang: I18nContext.current()?.lang,
        }),
      );
    }

    const passwordHash = await hashPassword(dto.password);
    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpiresAt = getExpiryDate("24h");
    const status = env.NODE_ENV === "test" ? "ACTIVE" : "PENDING_VERIFICATION";

    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(users).values({
          email: dto.email,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          passwordHash,
          verificationToken,
          verificationExpiresAt,
          status,
        });

        // WHY: Store email verification event in the outbox_events table as part of the transaction for atomic consistency.
        await tx.insert(outboxEvents).values({
          eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
          payload: {
            email: dto.email,
            fullName: dto.fullName,
            token: verificationToken,
          },
        });
      });
    } catch (error) {
      if (isPostgresErrorCode(error, PG_ERROR_CODE.UNIQUE_VIOLATION)) {
        throw new ConflictException(
          this.i18n.t("auth.EMAIL_ALREADY_EXISTS", {
            lang: I18nContext.current()?.lang,
          }),
        );
      }
      throw error;
    }
    return;
  }

  async verifyEmail(token: string): Promise<void> {
    const [user] = await this.db
      .select({
        id: users.id,
        verificationExpiresAt: users.verificationExpiresAt,
      })
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      this.throwException("auth.VERIFICATION_TOKEN_INVALID");
    }

    if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
      this.throwException("auth.VERIFICATION_TOKEN_EXPIRED");
    }

    await this.db
      .update(users)
      .set({
        status: "ACTIVE",
        verificationToken: null,
        verificationExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    return;
  }

  async resendVerificationEmail(dto: ResendVerificationDto): Promise<void> {
    const TOKEN_TTL_MS = TIME_IN_MS.DAY; // 24 hours
    const RESEND_COOLDOWN_MS = TIME_IN_MS.MINUTE; // 1 minute

    await this.db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          status: users.status,
          verificationExpiresAt: users.verificationExpiresAt,
        })
        .from(users)
        .where(eq(users.email, dto.email))
        .for("update")
        .limit(1);

      // WHY: Protect against user enumeration — return silently if user missing or not pending verification.
      if (user?.status !== "PENDING_VERIFICATION") {
        return;
      }

      // WHY: Enforce 60s cooldown between resend requests to prevent email spamming and token override race conditions.
      if (user.verificationExpiresAt) {
        const tokenCreatedAt =
          user.verificationExpiresAt.getTime() - TOKEN_TTL_MS;
        if (Date.now() - tokenCreatedAt < RESEND_COOLDOWN_MS) {
          return;
        }
      }

      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpiresAt = getExpiryDate("24h");

      await tx
        .update(users)
        .set({
          verificationToken,
          verificationExpiresAt,
        })
        .where(eq(users.id, user.id));

      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.AUTH_VERIFICATION_EMAIL_REQUESTED,
        payload: {
          email: user.email,
          fullName: user.fullName,
          token: verificationToken,
        },
      });
    });

    return;
  }

  async login(
    dto: LoginDto,
    metadata?: ClientMetadata,
  ): Promise<LoginResponseDto> {
    const [user] = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        status: users.status,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (
      !user?.passwordHash ||
      user.status === "INACTIVE" ||
      user.status === "SUSPENDED"
    ) {
      this.throwException("auth.INVALID_CREDENTIALS");
    }

    if (user.status === "PENDING_VERIFICATION") {
      this.throwException("auth.EMAIL_NOT_VERIFIED");
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.throwException("auth.INVALID_CREDENTIALS");
    }

    const { accessToken, refreshToken } = await this.createTokenSession(
      user.id,
      user.email,
      user.role,
      metadata,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refreshToken(
    dto: RefreshTokenDto,
    metadata?: ClientMetadata,
  ): Promise<RefreshResponseDto> {
    const hashedIncoming = sha256(dto.refreshToken);

    const [deletedToken] = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashedIncoming))
      .returning({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        isRevoked: refreshTokens.isRevoked,
        expiresAt: refreshTokens.expiresAt,
      });

    if (
      !deletedToken ||
      deletedToken.isRevoked ||
      deletedToken.expiresAt < new Date()
    ) {
      this.throwException(
        "auth.TOKEN_INVALID_OR_EXPIRED",
        UnauthorizedException,
      );
    }

    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, deletedToken.userId))
      .limit(1);

    if (user?.status !== "ACTIVE") {
      this.throwException(
        "auth.TOKEN_INVALID_OR_EXPIRED",
        UnauthorizedException,
      );
    }

    const { accessToken, refreshToken } = await this.createTokenSession(
      user.id,
      user.email,
      user.role,
      metadata,
    );

    return { accessToken, refreshToken };
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const hashedIncoming = sha256(dto.refreshToken);

    const [deletedToken] = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashedIncoming))
      .returning({
        id: refreshTokens.id,
        isRevoked: refreshTokens.isRevoked,
        expiresAt: refreshTokens.expiresAt,
      });

    if (
      !deletedToken ||
      deletedToken.isRevoked ||
      deletedToken.expiresAt < new Date()
    ) {
      this.throwException(
        "auth.TOKEN_INVALID_OR_EXPIRED",
        UnauthorizedException,
      );
    }

    return;
  }

  async logoutAll(userId: string): Promise<void> {
    if (!userId) {
      this.throwException(
        "auth.TOKEN_INVALID_OR_EXPIRED",
        UnauthorizedException,
      );
    }

    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));

    return;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const [user] = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        status: users.status,
      })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    // WHY: Prevention of User Enumeration attacks. Return success generic message without exposing if email exists.
    if (user?.status !== "ACTIVE") {
      return;
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetPasswordExpiresAt = getExpiryDate("15m");

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt,
        })
        .where(eq(users.id, user.id));

      // WHY: Save email sending request event in outbox_events to decouple DB update and BullMQ publish.
      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.AUTH_RESET_PASSWORD_EMAIL_REQUESTED,
        payload: {
          email: dto.email,
          fullName: user.fullName,
          token: resetToken,
        },
      });
    });

    return;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const [user] = await this.db
      .select({
        id: users.id,
        resetPasswordExpiresAt: users.resetPasswordExpiresAt,
      })
      .from(users)
      .where(eq(users.resetPasswordToken, dto.token))
      .limit(1);

    if (
      !user?.resetPasswordExpiresAt ||
      user.resetPasswordExpiresAt < new Date()
    ) {
      this.throwException("auth.RESET_PASSWORD_TOKEN_INVALID");
    }

    const passwordHash = await hashPassword(dto.password);

    await this.db.transaction(async (tx) => {
      // WHY: Update password hash and clean reset token fields to prevent token reuse.
      await tx
        .update(users)
        .set({
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpiresAt: null,
        })
        .where(eq(users.id, user.id));

      // WHY: Session invalidation (force-logout from all devices). Delete all active refresh tokens.
      await tx.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));
    });

    return;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const [user] = await this.db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      this.throwException("auth.INVALID_CREDENTIALS", BadRequestException);
    }

    if (!user.passwordHash) {
      this.throwException(
        "auth.CANNOT_CHANGE_OAUTH_PASSWORD",
        BadRequestException,
      );
    }

    const isPasswordValid = await comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.throwException(
        "auth.INVALID_CURRENT_PASSWORD",
        UnauthorizedException,
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      this.throwException("auth.NEW_PASSWORD_SAME_AS_OLD", BadRequestException);
    }

    const newPasswordHash = await hashPassword(dto.newPassword);

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          passwordHash: newPasswordHash,
        })
        .where(eq(users.id, userId));

      // WHY: Global session revocation (force-logout all devices). Delete all active refresh tokens for the user.
      await tx.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    });

    return;
  }
}
