import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import {
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
  ApiBadRequestResponseRfc9457,
  ApiUnauthorizedResponseRfc9457,
  ApiForbiddenResponseRfc9457,
  ApiConflictResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
  ApiNotFoundResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { SHOWS_ROUTES } from "./shows.routes";
import { ShowsService } from "./shows.service";
import {
  CreateShowDto,
  ShowResponseDto,
  CreateShowBatchDto,
  BatchShowResponseDto,
  ShowScheduleQueryDto,
  ShowScheduleItemDto,
} from "./dto";

@ApiTags(SHOWS_ROUTES.BASE)
@Controller(SHOWS_ROUTES.BASE)
@UseGuards(CustomThrottlerGuard)
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Discover showtime schedule by movie, cinema, and date",
    description:
      "Public endpoint to query available movie showtimes filtered by date, optional movie ID, and optional cinema ID with real-time seat availability.",
  })
  @ApiOkResponseGeneric(ShowScheduleItemDto, { isArray: true })
  @ApiBadRequestResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getShows(
    @Query() query: ShowScheduleQueryDto,
  ): Promise<ApiResponse<ShowScheduleItemDto[]>> {
    const showsList = await this.showsService.findShows(query);
    return apiSuccess(showsList);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create showtime with pre-allocated seats",
    description:
      "Admin endpoint to schedule a showtime, calculate end time, check 15m schedule collision, and pre-allocate seats.",
  })
  @ApiCreatedResponseGeneric(ShowResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiConflictResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async createShow(
    @Body() dto: CreateShowDto,
  ): Promise<ApiResponse<ShowResponseDto>> {
    const show = await this.showsService.createShow(dto);
    return apiSuccess(show);
  }

  @Post(SHOWS_ROUTES.BATCH)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create recurring batch showtimes across date range",
    description:
      "Admin endpoint to schedule recurring showtimes across a date range with seat pre-allocation, intra-batch timeline validation, and all-or-nothing rollback.",
  })
  @ApiCreatedResponseGeneric(BatchShowResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiUnauthorizedResponseRfc9457()
  @ApiForbiddenResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiConflictResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async createShowBatch(
    @Body() dto: CreateShowBatchDto,
  ): Promise<ApiResponse<BatchShowResponseDto>> {
    const batchSummary = await this.showsService.createShowBatch(dto);
    return apiSuccess(batchSummary);
  }
}
