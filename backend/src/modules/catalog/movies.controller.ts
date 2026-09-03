import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard";
import {
  ApiBadRequestResponseRfc9457,
  ApiNotFoundResponseRfc9457,
  ApiOkResponseGeneric,
  ApiOkResponsePaginated,
  ApiTooManyRequestsResponseRfc9457,
} from "@/common/decorators";
import { apiSuccess, type ApiResponse } from "@/common/utils/api-response.util";
import { CATALOG_ROUTES } from "./catalog.routes";
import { MoviesService } from "./movies.service";
import {
  MovieDetailParamDto,
  MovieDetailQueryDto,
  MovieListQueryDto,
  MovieResponseDto,
  PaginationMetaDto,
} from "./dto";

@ApiTags(CATALOG_ROUTES.MOVIES)
@Controller(CATALOG_ROUTES.MOVIES)
@UseGuards(CustomThrottlerGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Discover public movies with pagination, genre, status, and text search filters",
  })
  @ApiOkResponsePaginated(MovieResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getMovies(
    @Query() query: MovieListQueryDto,
  ): Promise<ApiResponse<MovieResponseDto[], PaginationMetaDto>> {
    const { data, meta } = await this.moviesService.findMovies(query);
    return apiSuccess(data, meta);
  }

  @Get(CATALOG_ROUTES.DETAILS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get detailed movie information by UUIDv7 identifier",
  })
  @ApiOkResponseGeneric(MovieResponseDto)
  @ApiBadRequestResponseRfc9457()
  @ApiNotFoundResponseRfc9457()
  @ApiTooManyRequestsResponseRfc9457()
  async getMovieById(
    @Param() param: MovieDetailParamDto,
    @Query() query: MovieDetailQueryDto,
  ): Promise<ApiResponse<MovieResponseDto>> {
    const result = await this.moviesService.findMovieById(param.id, query.lang);
    return apiSuccess(result);
  }
}
