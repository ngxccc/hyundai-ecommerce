import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";
import { zUuidV7 } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import {
  formatTimezoneDate,
  getFutureTimezoneDate,
} from "@/common/utils/date.util";
import {
  catalogLanguageEnum,
  type CatalogLanguage,
} from "@/modules/catalog/dto/movie-list-query.dto";
import { SHOWS_CONSTANTS } from "../shows.constants";

/**
 * Validation schema for public showtime schedule discovery query parameters (GET /shows).
 */
export const showScheduleQuerySchema = z
  .object({
    movieId: zUuidV7().optional(),
    cinemaId: zUuidV7().optional(),
    date: z.iso
      .date(i18nZodMsg("validation.isDate"))
      .default(() =>
        formatTimezoneDate(new Date(), SHOWS_CONSTANTS.DEFAULT_TIMEZONE),
      ),
    lang: catalogLanguageEnum.default("vi"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.date) return;
    const todayStr = formatTimezoneDate(
      new Date(),
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );
    const maxDateStr = getFutureTimezoneDate(
      14,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );

    if (data.date < todayStr) {
      ctx.addIssue({
        code: "custom",
        message: i18nZodMsg("shows.DATE_PAST"),
        path: ["date"],
      });
      return;
    }

    if (data.date > maxDateStr) {
      ctx.addIssue({
        code: "custom",
        message: i18nZodMsg("shows.DATE_HORIZON_EXCEEDED", { maxDays: 14 }),
        path: ["date"],
      });
    }
  });

export type ShowScheduleQueryDtoType = z.infer<typeof showScheduleQuerySchema>;

/**
 * Data Transfer Object for public showtime schedule discovery query parameters.
 */
export class ShowScheduleQueryDto implements ShowScheduleQueryDtoType {
  public static readonly zodSchema = showScheduleQuerySchema;

  @ApiPropertyOptional({
    description: "Filter showtimes by movie UUIDv7 identifier",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
  })
  public movieId?: string;

  @ApiPropertyOptional({
    description: "Filter showtimes by cinema UUIDv7 identifier",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
  })
  public cinemaId?: string;

  @ApiPropertyOptional({
    description:
      "Filter showtimes for a specific calendar date (YYYY-MM-DD). Defaults to today in Asia/Ho_Chi_Minh (+07:00). Max 14 days horizon.",
    example: "2026-09-02",
  })
  public date!: string;

  @ApiPropertyOptional({
    description: "Localization language code for movie metadata",
    enum: ["vi", "en"],
    example: "vi",
    default: "vi",
  })
  public lang!: CatalogLanguage;
}
