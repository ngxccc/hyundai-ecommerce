import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import {
  zNumericString,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";

/**
 * Validation schema for GET /cinemas query parameters.
 */
export const cinemaListQuerySchema = z
  .object({
    city: zSanitizedString({ min: 1, max: 100 }).optional(),
    ward: zSanitizedString({ min: 1, max: 100 }).optional(),
    search: zSanitizedString({ min: 1, max: 100 }).optional(),
    page: zNumericString({ min: 1, integer: true }).default(1),
    limit: zNumericString({ min: 1, max: 100, integer: true }).default(20),
  })
  .strict();

export type CinemaListQueryDtoType = z.infer<typeof cinemaListQuerySchema>;

/**
 * Data Transfer Object for public cinema venue discovery query parameters.
 */
export class CinemaListQueryDto implements CinemaListQueryDtoType {
  public static readonly zodSchema = cinemaListQuerySchema;

  @ApiPropertyOptional({
    description: "Filter by city or province name",
    example: "Thành phố Hồ Chí Minh",
  })
  public city?: string;

  @ApiPropertyOptional({
    description: "Filter by ward or commune name",
    example: "Phường Bến Nghé",
  })
  public ward?: string;

  @ApiPropertyOptional({
    description: "Search keyword matching cinema venue name or street address",
    example: "Vincom",
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
}
