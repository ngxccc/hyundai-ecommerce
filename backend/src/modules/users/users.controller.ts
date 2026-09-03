import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import {
  ApiOkResponseGeneric,
  ApiUnauthorizedResponseRfc9457,
  ApiForbiddenResponseRfc9457,
  ApiNotFoundResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { USERS_ROUTES } from "./users.routes";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";

@ApiTags(USERS_ROUTES.BASE)
@Controller(USERS_ROUTES.BASE)
@UseGuards(CustomThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(USERS_ROUTES.ME)
  @UseGuards(JwtAuthGuard)
  @Throttle({
    auth: { limit: 30, ttl: 60000 },
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get authenticated user profile",
    description:
      "Returns profile details and account status for the currently authenticated user.",
  })
  @ApiOkResponseGeneric(UserResponseDto)
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getMe(
    @CurrentUser("sub") userId: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    const profile = await this.usersService.getProfile(userId);
    return apiSuccess(profile);
  }
}
