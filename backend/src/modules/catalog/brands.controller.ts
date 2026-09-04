import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  ApiConflictResponseRfc9457,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { CATALOG_ROUTES } from "./catalog.routes";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { BrandResponseDto } from "./dto/brand-response.dto";

@ApiTags(CATALOG_ROUTES.BRANDS.TAG)
@Controller(CATALOG_ROUTES.BRANDS.PREFIX)
@UseGuards(CustomThrottlerGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get(CATALOG_ROUTES.BRANDS.FIND_ALL)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "List all brands",
    description: "Returns a list of all active brands ordered by name.",
  })
  @ApiOkResponseGeneric(BrandResponseDto, { isArray: true })
  @ApiTooManyRequestsResponseRfc9457()
  async getAll(): Promise<ApiResponse<BrandResponseDto[]>> {
    const brands = await this.brandsService.findAll();
    return apiSuccess(brands);
  }

  @Get(CATALOG_ROUTES.BRANDS.FIND_BY_ID)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "Get brand by ID",
    description: "Returns details of a specific brand by UUID.",
  })
  @ApiOkResponseGeneric(BrandResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<BrandResponseDto>> {
    const brand = await this.brandsService.findById(id);
    return apiSuccess(brand);
  }

  @Post(CATALOG_ROUTES.BRANDS.CREATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create brand (Admin only)",
    description: "Creates a new brand in the catalog.",
  })
  @ApiCreatedResponseGeneric(BrandResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async create(
    @Body() dto: CreateBrandDto,
  ): Promise<ApiResponse<BrandResponseDto>> {
    const created = await this.brandsService.create(dto);
    return apiSuccess(created);
  }

  @Put(CATALOG_ROUTES.BRANDS.UPDATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update brand (Admin only)",
    description: "Updates an existing brand by UUID.",
  })
  @ApiOkResponseGeneric(BrandResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ): Promise<ApiResponse<BrandResponseDto>> {
    const updated = await this.brandsService.update(id, dto);
    return apiSuccess(updated);
  }

  @Delete(CATALOG_ROUTES.BRANDS.DELETE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete brand (Admin only)",
    description: "Deletes an existing brand by UUID.",
  })
  @ApiOkResponseGeneric(Object)
  @ApiNotFoundResponseRfc9457()
  async delete(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    await this.brandsService.delete(id);
    return apiSuccess(null);
  }
}
