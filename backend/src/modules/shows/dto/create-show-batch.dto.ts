import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { SHOWS_CONSTANTS } from "../shows.constants";

/**
 * Validation schema for batch show schedule creation requests.
 */
export const createShowBatchSchema = z
  .object({
    movieId: zUuidV7(),
    hallId: zUuidV7(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    timeSlots: z
      .array(
        z
          .string(i18nZodMsg("validation.isString"))
          .regex(
            SHOWS_CONSTANTS.TIME_SLOT_REGEX,
            i18nZodMsg("validation.matches"),
          ),
      )
      .min(1, i18nZodMsg("validation.isNotEmpty"))
      .max(
        SHOWS_CONSTANTS.MAX_SLOTS_PER_DAY,
        i18nZodMsg("validation.maxLength", {
          "0": SHOWS_CONSTANTS.MAX_SLOTS_PER_DAY,
        }),
      ),
    basePrice: z
      .number(i18nZodMsg("validation.isInt"))
      .int(i18nZodMsg("validation.isInt"))
      .min(0),
  })
  .strict();

export type CreateShowBatchDtoType = z.infer<typeof createShowBatchSchema>;

/**
 * Data Transfer Object for creating recurring showtimes across date range.
 */
export class CreateShowBatchDto implements CreateShowBatchDtoType {
  public static readonly zodSchema = createShowBatchSchema;

  @ApiProperty({
    description: "UUIDv7 of the movie to be scheduled",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
  })
  public movieId!: string;

  @ApiProperty({
    description: "UUIDv7 of the cinema hall where shows take place",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
  })
  public hallId!: string;

  @ApiProperty({
    description: "Start date of the batch schedule (YYYY-MM-DD)",
    example: "2026-09-01",
  })
  public startDate!: string;

  @ApiProperty({
    description: "End date of the batch schedule (inclusive, YYYY-MM-DD)",
    example: "2026-09-03",
  })
  public endDate!: string;

  @ApiProperty({
    description: "Array of recurring daily time slots in 24-hour HH:mm format",
    example: ["10:00", "14:30", "19:00"],
    type: [String],
  })
  public timeSlots!: string[];

  @ApiProperty({
    description: "Base ticket price in VND",
    example: 100000,
    minimum: 0,
  })
  public basePrice!: number;
}
