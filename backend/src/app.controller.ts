import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

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
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
      },
    },
  })
  getHealth() {
    return { status: "ok" };
  }
}
