import type { DrizzleDB } from "@/database/database.module";
import { createShow } from "../factories/show.factory";
import type { Show } from "@/database/schemas";

export const ShowMother = {
  /** Show scheduled for tomorrow (+24h from now, 2h duration) */
  tomorrow(db: DrizzleDB, hallId?: string, movieId?: string): Promise<Show> {
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 7200000);

    return createShow(db, {
      hallId,
      movieId,
      startTime: start,
      endTime: end,
      basePrice: 100000,
    });
  },

  /** Show scheduled at specific start and end timestamps with custom base price */
  scheduled(
    db: DrizzleDB,
    hallId: string,
    movieId: string,
    startTime: Date,
    endTime: Date,
    basePrice = 100000,
  ): Promise<Show> {
    return createShow(db, {
      hallId,
      movieId,
      startTime,
      endTime,
      basePrice,
    });
  },
} as const;
