import { Inject, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { CinemaListResponseDto, type CinemaListQueryDto } from "./dto";
import { and, asc, eq, sql } from "drizzle-orm";
import { cinemas, halls } from "@/database/schemas";
import { cinemaFilters } from "./filters";

/**
 * Service managing public cinema venue discovery and filtering.
 */
@Injectable()
export class CinemasService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    public readonly db: DrizzleDB,
    public readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Discovers cinema venues with city, ward, and name search filters.
   *
   * @param query Validated cinema query filter parameters
   * @returns Paginated cinema list with metadata envelope
   */
  async findCinemas(query: CinemaListQueryDto): Promise<CinemaListResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const whereClause = and(
      cinemaFilters.byCity(query.city),
      cinemaFilters.byWard(query.ward),
      cinemaFilters.bySearch(query.search),
    );

    const [countResult] = await this.db
      .select({
        count: sql<number>`cast(count(distinct ${cinemas.id}) as int)`,
      })
      .from(cinemas)
      .where(whereClause);

    const total = countResult?.count ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    if (total === 0) {
      return {
        data: [],
        meta: { page, limit, total, totalPages },
      };
    }

    const cinemaRows = await this.db
      .select({
        id: cinemas.id,
        name: cinemas.name,
        city: cinemas.city,
        ward: cinemas.ward,
        streetAddress: cinemas.streetAddress,
        postalCode: cinemas.postalCode,
        latitude: cinemas.latitude,
        longitude: cinemas.longitude,
        totalHalls: sql<number>`cast(count(${halls.id}) as int)`,
      })
      .from(cinemas)
      .leftJoin(halls, eq(halls.cinemaId, cinemas.id))
      .where(whereClause)
      .groupBy(cinemas.id)
      .orderBy(
        asc(cinemas.city),
        asc(cinemas.ward),
        asc(cinemas.name),
        asc(cinemas.id),
      )
      .limit(limit)
      .offset(offset);

    return {
      data: cinemaRows,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
