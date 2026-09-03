import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import {
  catalogLanguageEnum,
  type CatalogLanguage,
} from "./movie-list-query.dto";

/**
 * Validation schema for GET /movies/:id path parameters.
 */
export const movieDetailParamSchema = z
  .object({
    id: zUuidV7(),
  })
  .strict();

export type MovieDetailParamDtoType = z.infer<typeof movieDetailParamSchema>;

/**
 * Data Transfer Object for movie details path parameters.
 */
export class MovieDetailParamDto implements MovieDetailParamDtoType {
  public static readonly zodSchema = movieDetailParamSchema;

  @ApiProperty({
    description: "UUIDv7 identifier of the movie",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
  })
  public id!: string;
}

/**
 * Validation schema for GET /movies/:id query parameters.
 */
export const movieDetailQuerySchema = z
  .object({
    lang: catalogLanguageEnum.default("vi"),
  })
  .strict();

export type MovieDetailQueryDtoType = z.infer<typeof movieDetailQuerySchema>;

/**
 * Data Transfer Object for movie details query parameters.
 */
export class MovieDetailQueryDto implements MovieDetailQueryDtoType {
  public static readonly zodSchema = movieDetailQuerySchema;

  @ApiPropertyOptional({
    description: "Localization language code",
    enum: ["vi", "en"],
    example: "vi",
    default: "vi",
  })
  public lang!: CatalogLanguage;
}
