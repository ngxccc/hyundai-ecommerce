import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import {
  ApiAuth,
  ApiOkResponseGeneric,
  ApiNotFoundResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { USERS_ROUTES } from "./users.routes";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";

@ApiTags(USERS_ROUTES.BASE)
@Controller({ path: USERS_ROUTES.BASE, version: "1" })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(USERS_ROUTES.ME)
  @Throttle({
    auth: { limit: 30, ttl: 60000 },
  })
  @ApiAuth()
  @ApiOperation({
    summary: "Get authenticated user profile",
    description:
      "Returns profile details and account status for the currently authenticated user.",
  })
  @ApiOkResponseGeneric(UserResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getMe(
    @CurrentUser("sub") userId: string,
  ): Promise<ApiResponse<UserResponseDto>> {
    const profile = await this.usersService.getProfile(userId);
    return apiSuccess(profile);
  }
}
