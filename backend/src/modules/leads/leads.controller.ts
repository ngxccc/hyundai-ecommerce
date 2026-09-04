import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import {
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
  ApiNotFoundResponseRfc9457,
  ApiBadRequestResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { LEADS_ROUTES } from "./leads.routes";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { LeadResponseDto } from "./dto/lead-response.dto";

@ApiTags(LEADS_ROUTES.TAG)
@Controller(LEADS_ROUTES.PREFIX)
@UseGuards(CustomThrottlerGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Public endpoint for Storefront visitors to submit Request for Quote (RFQ).
   * No login or authentication required. Rate-limited to prevent form spam.
   */
  @Post(LEADS_ROUTES.SUBMIT_RFQ)
  @HttpCode(HttpStatus.CREATED)
  @Throttle({
    public: { limit: 10, ttl: 60000 },
  })
  @ApiOperation({
    summary: "Submit Request for Quote (Storefront RFQ)",
    description:
      "Public endpoint allowing customers and B2B buyers to request quotes for products without signing up.",
  })
  @ApiCreatedResponseGeneric(LeadResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async submitRfq(
    @Body() dto: CreateLeadDto,
  ): Promise<ApiResponse<LeadResponseDto>> {
    const lead = await this.leadsService.submitRfq(dto);
    return apiSuccess(lead);
  }

  /**
   * Internal CMS endpoint: Retrieve all leads for Sales and Admin staff.
   */
  @Get(LEADS_ROUTES.FIND_ALL)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List all leads (CMS Admin & Sales)",
    description:
      "Returns all leads and quote requests ordered by latest submission date.",
  })
  @ApiOkResponseGeneric(LeadResponseDto, { isArray: true })
  async getAll(): Promise<ApiResponse<LeadResponseDto[]>> {
    const allLeads = await this.leadsService.findAll();
    return apiSuccess(allLeads);
  }

  /**
   * Internal CMS endpoint: Retrieve lead details by UUID.
   */
  @Get(LEADS_ROUTES.FIND_BY_ID)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get lead by ID (CMS Admin & Sales)",
    description: "Returns full lead information and list of requested items.",
  })
  @ApiOkResponseGeneric(LeadResponseDto)
  @ApiNotFoundResponseRfc9457()
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<LeadResponseDto>> {
    const lead = await this.leadsService.findById(id);
    return apiSuccess(lead);
  }

  /**
   * Internal CMS endpoint: Update lead pipeline status.
   */
  @Patch(LEADS_ROUTES.UPDATE_STATUS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SALES")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update lead status (CMS Admin & Sales)",
    description:
      "Updates lead status in sales pipeline (CONTACTING, SURVEY_SCHEDULED, QUOTED, LOST, etc.).",
  })
  @ApiOkResponseGeneric(LeadResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiBadRequestResponseRfc9457()
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
  ): Promise<ApiResponse<LeadResponseDto>> {
    const updated = await this.leadsService.updateStatus(id, dto);
    return apiSuccess(updated);
  }

  /**
   * Internal CMS endpoint: Assign lead to a specific Sales representative.
   */
  @Patch(LEADS_ROUTES.ASSIGN_SALES)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Assign sales representative to lead (Admin only)",
    description: "Assigns a designated sales user ID to manage this lead.",
  })
  @ApiOkResponseGeneric(LeadResponseDto)
  @ApiNotFoundResponseRfc9457()
  async assignSales(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("salesId", ParseUUIDPipe) salesId: string,
  ): Promise<ApiResponse<LeadResponseDto>> {
    const updated = await this.leadsService.assignSales(id, salesId);
    return apiSuccess(updated);
  }
}
