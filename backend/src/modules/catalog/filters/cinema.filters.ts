import { ilike, or, type SQL } from "drizzle-orm";
import { cinemas } from "@/database/schemas";
import { escapeLikePattern } from "./movie.filters";

/**
 * Composable, type-safe Drizzle filter specification helpers for cinema venue queries.
 */
export const cinemaFilters = {
  /**
   * Filters cinema venues by city or province name substring.
   */
  byCity: (city?: string): SQL | undefined =>
    city ? ilike(cinemas.city, `%${escapeLikePattern(city)}%`) : undefined,

  /**
   * Filters cinema venues by ward or commune name substring.
   */
  byWard: (ward?: string): SQL | undefined =>
    ward ? ilike(cinemas.ward, `%${escapeLikePattern(ward)}%`) : undefined,

  /**
   * Filters cinema venues by matching name or street address substring.
   */
  bySearch: (search?: string): SQL | undefined =>
    search
      ? or(
          ilike(cinemas.name, `%${escapeLikePattern(search)}%`),
          ilike(cinemas.streetAddress, `%${escapeLikePattern(search)}%`),
        )
      : undefined,
};
