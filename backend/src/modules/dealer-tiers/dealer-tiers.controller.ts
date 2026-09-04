import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import {
  ApiOkResponseGeneric,
  ApiNotFoundResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { DEALER_TIERS_ROUTES } from "./dealer-tiers.routes";
import { DealerTiersService } from "./dealer-tiers.service";
import { DealerTierResponseDto } from "./dto/dealer-tier-response.dto";

@ApiTags(DEALER_TIERS_ROUTES.BASE)
@Controller(DEALER_TIERS_ROUTES.BASE)
@UseGuards(CustomThrottlerGuard)
export class DealerTiersController {
  constructor(private readonly dealerTiersService: DealerTiersService) {}

  @Get()
  @Throttle({
    public: { limit: 60, ttl: 60000 },
  })
  @ApiOperation({
    summary: "List all dealer discount tiers",
    description:
      "Returns all configured B2B dealer tiers with their minimum spend and discount percentages.",
  })
  @ApiOkResponseGeneric(DealerTierResponseDto, { isArray: true })
  @ApiTooManyRequestsResponseRfc9457()
  async getAll(): Promise<ApiResponse<DealerTierResponseDto[]>> {
    const tiers = await this.dealerTiersService.findAll();
    return apiSuccess(tiers);
  }

  @Get(DEALER_TIERS_ROUTES.BY_ID)
  @Throttle({
    public: { limit: 60, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Get dealer tier by ID",
    description: "Returns details of a specific dealer tier by UUID.",
  })
  @ApiOkResponseGeneric(DealerTierResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<DealerTierResponseDto>> {
    const tier = await this.dealerTiersService.findById(id);
    return apiSuccess(tier);
  }
}
