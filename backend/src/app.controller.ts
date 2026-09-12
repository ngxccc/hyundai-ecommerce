import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthResponseDto } from "./app.dto";

@ApiTags("app")
@Controller()
export class AppController {
  @Get()
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
