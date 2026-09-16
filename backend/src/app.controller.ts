import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthResponseDto } from "./app.dto";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("app")
@SkipThrottle()
@Controller()
export class AppController {
  @Public()
  @Get(["", "health"])
  @ApiOperation({
    summary: "System health check",
    description: "Returns service operational status.",
  })
  @ApiOkResponse({
    description: "Service is operational",
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return { status: "ok" };
  }
}
