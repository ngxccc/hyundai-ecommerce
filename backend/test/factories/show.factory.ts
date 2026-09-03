import type { DrizzleDB } from "@/database/database.module";
import {
  shows,
  showSeats,
  type Show,
  type NewShow,
  type ShowSeat,
  type NewShowSeat,
} from "@/database/schemas";
import { createMovie } from "./movie.factory";
import { createHall, createSeatType, createBatchSeats } from "./cinema.factory";

export async function createShow(
  db: DrizzleDB,
  overrides: Partial<NewShow> = {},
): Promise<Show> {
  const movieId = overrides.movieId ?? (await createMovie(db)).id;
  const hallId = overrides.hallId ?? (await createHall(db)).id;

  const startTime = overrides.startTime ?? new Date(Date.now() + 86400000);
  const endTime = overrides.endTime ?? new Date(startTime.getTime() + 7200000);

  const [show] = await db
    .insert(shows)
    .values({
      movieId,
      hallId,
      startTime,
      endTime,
      basePrice: 100000,
      ...overrides,
    })
    .returning();

  if (!show) {
    throw new Error("Failed to create Show entity in test factory");
  }
  return show;
}

export async function createShowSeat(
  db: DrizzleDB,
  overrides: Partial<NewShowSeat> = {},
): Promise<ShowSeat> {
  let showId = overrides.showId;
  let seatId = overrides.seatId;

  if (!showId) {
    const show = await createShow(db);
    showId = show.id;
  }

  if (!seatId) {
    const seatType = await createSeatType(db);
    const [seat] = await createBatchSeats(
      db,
      (await createHall(db)).id,
      seatType.id,
      1,
    );
    if (!seat) throw new Error("Failed to generate seat for showSeat factory");
    seatId = seat.id;
  }

  const [showSeat] = await db
    .insert(showSeats)
    .values({
      showId,
      seatId,
      status: "available",
      ...overrides,
    })
    .returning();

  if (!showSeat) {
    throw new Error("Failed to create ShowSeat entity in test factory");
  }
  return showSeat;
}

export async function createBatchShowSeats(
  db: DrizzleDB,
  showId: string,
  seatIds: string[],
): Promise<ShowSeat[]> {
  const values = seatIds.map((seatId) => ({
    showId,
    seatId,
    status: "available" as const,
  }));

  const inserted = await db.insert(showSeats).values(values).returning();
  return inserted;
}
