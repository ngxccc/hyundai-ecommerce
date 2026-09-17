import { Controller, Get, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  ApiAuth,
  ApiOkResponseGeneric,
  ApiUnauthorizedResponseRfc9457,
  Roles,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { ANALYTICS_ROUTES } from "./analytics.routes";
import { AnalyticsService } from "./analytics.service";
import {
  DashboardAnalyticsQueryDto,
  DashboardAnalyticsResponseDto,
  type DashboardAnalyticsResponseDtoType,
} from "./dto";

@ApiTags(ANALYTICS_ROUTES.TAG)
@Controller({ path: ANALYTICS_ROUTES.ROOT, version: "1" })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Retrieves aggregated business performance analytics for admin dashboard.
   *
   * @param query - Target year query parameter.
   * @returns Consolidated analytics response.
   */
  @Get(ANALYTICS_ROUTES.DASHBOARD)
  @ApiAuth()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Roles("ADMIN", "SALES")
  @ApiOperation({
    summary: "Get consolidated dashboard analytics",
    description:
      "Retrieves KPI metrics, monthly revenue time-series, category distribution, and top selling products for enterprise dashboard views.",
  })
  @ApiOkResponseGeneric(DashboardAnalyticsResponseDto)
  @ApiUnauthorizedResponseRfc9457()
  async getDashboardAnalytics(
    @Query() query: DashboardAnalyticsQueryDto,
  ): Promise<ApiResponse<DashboardAnalyticsResponseDtoType>> {
    const data = await this.analyticsService.getDashboardAnalytics(query);
    return apiSuccess(data);
  }
}
