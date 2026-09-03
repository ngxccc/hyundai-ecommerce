import type { DrizzleDB } from "@/database/database.module";
import {
  cinemas,
  halls,
  seatTypes,
  seats,
  type Cinema,
  type NewCinema,
  type Hall,
  type NewHall,
  type SeatType,
  type NewSeatType,
  type Seat,
  type NewSeat,
} from "@/database/schemas";

export async function createCinema(
  db: DrizzleDB,
  overrides: Partial<NewCinema> = {},
): Promise<Cinema> {
  const [cinema] = await db
    .insert(cinemas)
    .values({
      name: `Cinema-${crypto.randomUUID().slice(0, 8)}`,
      city: "Thành phố Hồ Chí Minh",
      ward: "Phường Bến Nghé",
      streetAddress: "72 Lê Thánh Tôn",
      postalCode: "70000",
      latitude: "10.77810000",
      longitude: "106.70250000",
      ...overrides,
    })
    .returning();

  if (!cinema) {
    throw new Error("Failed to create Cinema entity in test factory");
  }
  return cinema;
}

export async function createHall(
  db: DrizzleDB,
  overrides: Partial<NewHall> = {},
): Promise<Hall> {
  let cinemaId = overrides.cinemaId;
  if (!cinemaId) {
    const cinema = await createCinema(db);
    cinemaId = cinema.id;
  }

  const [hall] = await db
    .insert(halls)
    .values({
      cinemaId,
      name: `Hall-${crypto.randomUUID().slice(0, 4)}`,
      totalSeats: 0,
      ...overrides,
    })
    .returning();

  if (!hall) {
    throw new Error("Failed to create Hall entity in test factory");
  }
  return hall;
}

export async function createSeatType(
  db: DrizzleDB,
  overrides: Partial<NewSeatType> = {},
): Promise<SeatType> {
  const [seatType] = await db
    .insert(seatTypes)
    .values({
      name: `Standard-${crypto.randomUUID().slice(0, 8)}`,
      priceMultiplier: "1.00",
      ...overrides,
    })
    .returning();

  if (!seatType) {
    throw new Error("Failed to create SeatType entity in test factory");
  }
  return seatType;
}

export async function createSeat(
  db: DrizzleDB,
  overrides: Partial<NewSeat> = {},
): Promise<Seat> {
  let hallId = overrides.hallId;
  if (!hallId) {
    const hall = await createHall(db);
    hallId = hall.id;
  }

  let seatTypeId = overrides.seatTypeId;
  if (!seatTypeId) {
    const seatType = await createSeatType(db);
    seatTypeId = seatType.id;
  }

  const [seat] = await db
    .insert(seats)
    .values({
      hallId,
      seatTypeId,
      row: "A",
      number: 1,
      seatNumber: "A1",
      ...overrides,
    })
    .returning();

  if (!seat) {
    throw new Error("Failed to create Seat entity in test factory");
  }
  return seat;
}

export async function createBatchSeats(
  db: DrizzleDB,
  hallId: string,
  seatTypeId: string,
  count = 5,
  row = "A",
): Promise<Seat[]> {
  const seatValues: NewSeat[] = Array.from({ length: count }, (_, i) => ({
    hallId,
    seatTypeId,
    row,
    number: i + 1,
    seatNumber: `${row}${String(i + 1)}`,
  }));

  return db.insert(seats).values(seatValues).returning();
}
