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
  Query,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiAuth,
  ApiOkResponseGeneric,
  ApiOkResponsePaginated,
  ApiCreatedResponseGeneric,
  ApiNotFoundResponseRfc9457,
  ApiBadRequestResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
  Public,
} from "@/common/decorators";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AssignSalesDto,
  CreateLeadDto,
  LeadQueryDto,
  LeadResponseDto,
  UpdateLeadStatusDto,
} from "./dto";
import type { PaginationMetaDto } from "@/common/dto/pagination-meta.dto";
import { LEADS_ROUTES } from "./leads.routes";
import { LeadsService } from "./leads.service";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";

@ApiTags(LEADS_ROUTES.TAG)
@Controller({ path: LEADS_ROUTES.PREFIX, version: "1" })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Public endpoint for Storefront visitors to submit Request for Quote (RFQ).
   * No login or authentication required. Rate-limited to prevent form spam.
   */
  @Public()
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
  @ApiAuth("ADMIN", "SALES")
  @ApiOperation({
    summary: "List all leads (CMS Admin & Sales)",
    description:
      "Returns all leads and quote requests ordered by latest submission date.",
  })
  @ApiOkResponsePaginated(LeadResponseDto)
  async getAll(
    @Query() query: LeadQueryDto,
  ): Promise<ApiResponse<LeadResponseDto[], PaginationMetaDto>> {
    const { items, meta } = await this.leadsService.findAll(query);
    return apiSuccess(items, meta);
  }

  /**
   * Internal CMS endpoint: Retrieve lead details by UUID.
   */
  @Get(LEADS_ROUTES.FIND_BY_ID)
  @ApiAuth("ADMIN", "SALES")
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
  @ApiAuth("ADMIN", "SALES")
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
  @ApiAuth("ADMIN")
  @ApiOperation({
    summary: "Assign sales representative to lead (Admin only)",
    description: "Assigns a designated sales user ID to manage this lead.",
  })
  @ApiOkResponseGeneric(LeadResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiBadRequestResponseRfc9457()
  async assignSales(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignSalesDto,
  ): Promise<ApiResponse<LeadResponseDto>> {
    const updated = await this.leadsService.assignSales(id, dto.salesId);
    return apiSuccess(updated);
  }
}
