import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zNumericString,
  zSanitizedString,
  zUuidV7,
} from "@/common/schemas/zod-primitives";
import { movieRatingEnum } from "@/database/schemas/enums.schema";

/**
 * Movie status filter enum conforming to strict RESTful kebab-case URL standards.
 */
export const movieStatusEnum = z.enum(["now-showing", "coming-soon"]);
export type MovieStatus = z.infer<typeof movieStatusEnum>;

/**
 * Supported catalog localization languages.
 */
export const catalogLanguageEnum = z.enum(["vi", "en"]);
export type CatalogLanguage = z.infer<typeof catalogLanguageEnum>;

/**
 * Validation schema for GET /movies query parameters.
 */
export const movieListQuerySchema = z
  .object({
    status: movieStatusEnum.optional(),
    genreId: zUuidV7().optional(),
    rating: z.enum(movieRatingEnum.enumValues).optional(),
    search: zSanitizedString({ min: 1, max: 100 }).optional(),
    page: zNumericString({ min: 1, integer: true }).default(1),
    limit: zNumericString({ min: 1, max: 100, integer: true }).default(20),
    lang: catalogLanguageEnum.default("vi"),
  })
  .strict();

export type MovieListQueryDtoType = z.infer<typeof movieListQuerySchema>;

/**
 * Data Transfer Object for public movie catalog discovery query parameters.
 */
export class MovieListQueryDto implements MovieListQueryDtoType {
  public static readonly zodSchema = movieListQuerySchema;

  @ApiPropertyOptional({
    description: "Filter by schedule status (kebab-case)",
    enum: ["now-showing", "coming-soon"],
    example: "now-showing",
  })
  public status?: MovieStatus;

  @ApiPropertyOptional({
    description: "Filter by genre UUIDv7",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb01",
  })
  public genreId?: string;

  @ApiPropertyOptional({
    description: "Filter by movie age rating",
    enum: movieRatingEnum.enumValues,
    example: "PG_13",
  })
  public rating?: (typeof movieRatingEnum.enumValues)[number];

  @ApiPropertyOptional({
    description: "Search keyword matching Vietnamese and English movie titles",
    example: "Deadpool",
  })
  public search?: string;

  @ApiPropertyOptional({
    description: "Page index (1-based)",
    example: 1,
    default: 1,
  })
  public page!: number;

  @ApiPropertyOptional({
    description: "Number of records per page (1..100)",
    example: 20,
    default: 20,
  })
  public limit!: number;

  @ApiPropertyOptional({
    description: "Localization language code",
    enum: ["vi", "en"],
    example: "vi",
    default: "vi",
  })
  public lang!: CatalogLanguage;
}
