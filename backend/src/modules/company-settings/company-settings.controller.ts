import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  ApiAuth,
  ApiBadRequestResponseRfc9457,
  ApiForbiddenResponseRfc9457,
  ApiOkResponseGeneric,
  ApiTooManyRequestsResponseRfc9457,
  ApiUnauthorizedResponseRfc9457,
  Public,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { COMPANY_SETTINGS_ROUTES } from "./company-settings.routes";
import { CompanySettingsService } from "./company-settings.service";
import {
  CompanySettingsResponseDto,
  type CompanySettingsResponseDtoType,
} from "./dto/company-settings-response.dto";
import { UpdateCompanySettingsDto } from "./dto/update-company-settings.dto";

@ApiTags(COMPANY_SETTINGS_ROUTES.BASE)
@Controller({ path: COMPANY_SETTINGS_ROUTES.BASE, version: "1" })
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  @Get()
  @Public()
  @Throttle({
    public: { limit: 60, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Get company settings",
    description:
      "Returns company legal identity, contact hotlines, addresses, working hours, and banking details.",
  })
  @ApiOkResponseGeneric(CompanySettingsResponseDto)
  @ApiTooManyRequestsResponseRfc9457()
  async getSettings(): Promise<ApiResponse<CompanySettingsResponseDtoType>> {
    const settings = await this.companySettingsService.getSettings();
    return apiSuccess(settings);
  }

  @Put()
  @ApiAuth("ADMIN")
  @ApiOperation({
    summary: "Update company settings",
    description:
      "Updates company legal identity, contact channels, addresses, and banking details. Restricted to administrators.",
  })
  @ApiOkResponseGeneric(CompanySettingsResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  async updateSettings(
    @Body() dto: UpdateCompanySettingsDto,
  ): Promise<ApiResponse<CompanySettingsResponseDtoType>> {
    const updated = await this.companySettingsService.updateSettings(dto);
    return apiSuccess(updated);
  }
}
