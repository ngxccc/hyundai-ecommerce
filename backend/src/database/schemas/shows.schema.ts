import {
  index,
  integer,
  snakeCase,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { halls, seats } from "./cinemas.schema";
import { showSeatStatusEnum } from "./enums.schema";
import { baseEntity } from "./helpers.schema";
import { movies } from "./movies.schema";

/**
 * Shows table represents movie showtimes scheduled for specific halls.
 * Schedule Collision Invariant:
 * Protected at database level via PostgreSQL Exclusion Constraint (`no_hall_schedule_overlap` in drizzle migrations):
 * EXCLUDE USING gist (hall_id WITH =, tsrange(start_time, end_time + interval '15 minutes', '[)') WITH &&)
 */
export const shows = snakeCase.table(
  "shows",
  {
    ...baseEntity,
    movieId: uuid()
      .notNull()
      .references(() => movies.id, { onDelete: "restrict" }),
    hallId: uuid()
      .notNull()
      .references(() => halls.id, { onDelete: "restrict" }),
    startTime: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    endTime: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    basePrice: integer().notNull(),
  },
  (table) => [
    index("shows_movie_id_start_time_idx").on(table.movieId, table.startTime),
    index("shows_hall_id_start_time_idx").on(table.hallId, table.startTime),
  ],
);

export const showSeats = snakeCase.table(
  "show_seats",
  {
    ...baseEntity,
    showId: uuid()
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    seatId: uuid()
      .notNull()
      .references(() => seats.id, { onDelete: "restrict" }),
    status: showSeatStatusEnum().default("available").notNull(),
    lockedUntil: timestamp({ withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("show_seats_show_id_seat_id_uidx").on(
      table.showId,
      table.seatId,
    ),
    index("show_seats_status_locked_until_idx").on(
      table.status,
      table.lockedUntil,
    ),
  ],
);
export type Show = typeof shows.$inferSelect;
export type NewShow = typeof shows.$inferInsert;
export type ShowSeat = typeof showSeats.$inferSelect;
export type NewShowSeat = typeof showSeats.$inferInsert;
