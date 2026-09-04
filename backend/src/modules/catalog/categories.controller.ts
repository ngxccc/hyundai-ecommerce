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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";

@ApiTags(CATALOG_ROUTES.CATEGORIES.TAG)
@Controller(CATALOG_ROUTES.CATEGORIES.PREFIX)
@UseGuards(CustomThrottlerGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get(CATALOG_ROUTES.CATEGORIES.FIND_ALL)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "List all categories",
    description:
      "Returns a flat list of all active categories ordered by name.",
  })
  @ApiOkResponseGeneric(CategoryResponseDto, { isArray: true })
  @ApiTooManyRequestsResponseRfc9457()
  async getAll(): Promise<ApiResponse<CategoryResponseDto[]>> {
    const categories = await this.categoriesService.findAll();
    return apiSuccess(categories);
  }

  @Get(CATALOG_ROUTES.CATEGORIES.TREE)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "Get category tree",
    description: "Returns recursive hierarchical tree of categories.",
  })
  @ApiOkResponseGeneric(CategoryResponseDto, { isArray: true })
  @ApiTooManyRequestsResponseRfc9457()
  async getTree(): Promise<ApiResponse<CategoryResponseDto[]>> {
    const tree = await this.categoriesService.getTree();
    return apiSuccess(tree);
  }

  @Get(CATALOG_ROUTES.CATEGORIES.FIND_BY_ID)
  @Throttle({ public: { limit: 60, ttl: 60000 } })
  @ApiOperation({
    summary: "Get category by ID",
    description: "Returns details of a specific category by UUID.",
  })
  @ApiOkResponseGeneric(CategoryResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const category = await this.categoriesService.findById(id);
    return apiSuccess(category);
  }

  @Post(CATALOG_ROUTES.CATEGORIES.CREATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create category (Admin only)",
    description: "Creates a new category in the catalog.",
  })
  @ApiCreatedResponseGeneric(CategoryResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async create(
    @Body() dto: CreateCategoryDto,
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const created = await this.categoriesService.create(dto);
    return apiSuccess(created);
  }

  @Put(CATALOG_ROUTES.CATEGORIES.UPDATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update category (Admin only)",
    description: "Updates an existing category by UUID.",
  })
  @ApiOkResponseGeneric(CategoryResponseDto)
  @ApiNotFoundResponseRfc9457()
  @ApiBadRequestResponseRfc9457()
  @ApiConflictResponseRfc9457()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ApiResponse<CategoryResponseDto>> {
    const updated = await this.categoriesService.update(id, dto);
    return apiSuccess(updated);
  }

  @Delete(CATALOG_ROUTES.CATEGORIES.DELETE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete category (Admin only)",
    description: "Deletes an existing category by UUID.",
  })
  @ApiOkResponseGeneric(Object)
  @ApiNotFoundResponseRfc9457()
  async delete(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    await this.categoriesService.delete(id);
    return apiSuccess(null);
  }
}
