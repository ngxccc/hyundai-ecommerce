import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for single show creation requests.
 */
export const createShowSchema = z
  .object({
    movieId: zUuidV7(),
    hallId: zUuidV7(),
    startTime: z.iso.datetime({ offset: true }),
    basePrice: z
      .number(i18nZodMsg("validation.isInt"))
      .int(i18nZodMsg("validation.isInt"))
      .min(0),
  })
  .strict();

export type CreateShowDtoType = z.infer<typeof createShowSchema>;

/**
 * Data Transfer Object for creating a scheduled movie show.
 */
export class CreateShowDto implements CreateShowDtoType {
  public static readonly zodSchema = createShowSchema;

  @ApiProperty({
    description: "UUIDv7 of the movie to be scheduled",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
  })
  public movieId!: string;

  @ApiProperty({
    description: "UUIDv7 of the cinema hall where the show takes place",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
  })
  public hallId!: string;

  @ApiProperty({
    description: "ISO 8601 start timestamp with timezone",
    example: "2026-09-01T10:00:00.000Z",
  })
  public startTime!: string;

  @ApiProperty({
    description: "Base ticket price in VND",
    example: 100000,
    minimum: 0,
  })
  public basePrice!: number;
}
