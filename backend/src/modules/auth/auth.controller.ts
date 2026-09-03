import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { extractClientMetadata } from "@/common/utils/client-info.util";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import {
  ApiCreatedResponseGeneric,
  ApiOkResponseGeneric,
  ApiBadRequestResponseRfc9457,
  ApiUnauthorizedResponseRfc9457,
  ApiConflictResponseRfc9457,
  ApiInternalServerErrorResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { AUTH_ROUTES } from "./auth.routes";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  LoginResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
  ChangePasswordDto,
} from "./dto";

@UseGuards(CustomThrottlerGuard)
@Controller(AUTH_ROUTES.BASE)
@ApiTags(AUTH_ROUTES.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AUTH_ROUTES.REGISTER)
  @ApiOperation({
    summary: "Register new user account",
    description:
      "Creates an unverified account and enqueues an email verification link.",
  })
  @ApiCreatedResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<null>> {
    await this.authService.register(dto);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.VERIFY_EMAIL)
  @ApiOperation({
    summary: "Verify account email",
    description:
      "Validates a 64-character verification token and activates the user account.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ApiResponse<null>> {
    await this.authService.verifyEmail(dto.token);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.RESEND_VERIFICATION)
  @Throttle({
    auth: { limit: 3, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Resend email verification link",
    description:
      "Generates a fresh verification token and dispatches an activation email.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.resendVerificationEmail(dto);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.LOGIN)
  @ApiOperation({
    summary: "Authenticate user and issue tokens",
    description:
      "Verifies credentials and returns a short-lived access token and refresh token.",
  })
  @ApiOkResponseGeneric(LoginResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<ApiResponse<LoginResponseDto>> {
    const metadata = extractClientMetadata(req);
    const result = await this.authService.login(dto, metadata);
    return apiSuccess(result);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.REFRESH)
  @Throttle({
    auth: { limit: 10, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Rotate refresh token and renew access token",
    description:
      "Validates single-use refresh token, revokes it, and issues a new token pair.",
  })
  @ApiOkResponseGeneric(RefreshResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ApiResponse<RefreshResponseDto>> {
    const metadata = extractClientMetadata(req);
    const result = await this.authService.refreshToken(dto, metadata);
    return apiSuccess(result);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.LOGOUT)
  @ApiOperation({
    summary: "Revoke current refresh session",
    description:
      "Revokes the provided refresh token to end the active device session.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async logout(@Body() dto: RefreshTokenDto): Promise<ApiResponse<null>> {
    await this.authService.logout(dto);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.LOGOUT_ALL)
  @UseGuards(JwtAuthGuard)
  @Throttle({
    auth: { limit: 2, ttl: 60000 },
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Revoke all active user sessions",
    description:
      "Revokes all refresh tokens across every device for the authenticated user.",
  })
  @ApiOkResponseGeneric()
  @ApiUnauthorizedResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async logoutAll(
    @CurrentUser("sub") userId: string,
  ): Promise<ApiResponse<null>> {
    await this.authService.logoutAll(userId);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.FORGOT_PASSWORD)
  @Throttle({
    auth: { limit: 3, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Request password reset email",
    description:
      "Generates a time-limited password reset token and enqueues a recovery email.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.forgotPassword(dto);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.RESET_PASSWORD)
  @Throttle({
    auth: { limit: 5, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Reset password with token",
    description:
      "Applies new password using valid reset token and invalidates all existing sessions.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.resetPassword(dto);
    return apiSuccess(null);
  }

  @HttpCode(HttpStatus.OK)
  @Post(AUTH_ROUTES.CHANGE_PASSWORD)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({
    auth: { limit: 5, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Change account password",
    description:
      "Updates password for authenticated user and revokes all active refresh tokens.",
  })
  @ApiOkResponseGeneric()
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiInternalServerErrorResponseRfc9457()
  async changePassword(
    @CurrentUser("sub") userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.changePassword(userId, dto);
    return apiSuccess(null);
  }
}
