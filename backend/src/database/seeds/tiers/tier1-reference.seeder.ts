import type { DrizzleDB } from "@/database/database.module";
import { genres, seatTypes, users } from "@/database/schemas";
import { MASTER_GENRES } from "../data/genres.data";
import { SEAT_TYPES_DATA } from "../data/seat-types.data";
import { SEED_USERS_DATA } from "../data/users.data";
import {
  getSeedPasswordHash,
  isScopeActive,
  type SeedScope,
} from "../constants/seed.constant";
import type {
  SeededGenreRef,
  SeededSeatTypeRef,
  SeededUserRef,
  Tier1SeedResult,
} from "../types/seed.type";

/**
 * Seeds master movie genres idempotently using selective projection.
 *
 * @param db - Drizzle database client instance
 * @returns List of seeded genre reference entities (id, name)
 */
export async function seedGenres(db: DrizzleDB): Promise<SeededGenreRef[]> {
  await db
    .insert(genres)
    .values(MASTER_GENRES)
    .onConflictDoNothing({ target: genres.name });

  return db
    .select({
      id: genres.id,
      name: genres.name,
    })
    .from(genres);
}

/**
 * Seeds standard seat types and dynamic pricing multipliers idempotently.
 *
 * @param db - Drizzle database client instance
 * @returns List of seeded seat type reference entities (id, name, priceMultiplier)
 */
export async function seedSeatTypes(
  db: DrizzleDB,
): Promise<SeededSeatTypeRef[]> {
  await db
    .insert(seatTypes)
    .values(SEAT_TYPES_DATA)
    .onConflictDoNothing({ target: seatTypes.name });

  return db
    .select({
      id: seatTypes.id,
      name: seatTypes.name,
      priceMultiplier: seatTypes.priceMultiplier,
    })
    .from(seatTypes);
}

/**
 * Seeds default verified system users idempotently with memoized Scrypt password hash.
 *
 * @param db - Drizzle database client instance
 * @returns List of seeded user reference entities (id, email, role, fullName)
 */
export async function seedUsers(db: DrizzleDB): Promise<SeededUserRef[]> {
  const defaultPasswordHash = await getSeedPasswordHash();
  const usersToInsert = SEED_USERS_DATA.map((u) => ({
    email: u.email,
    fullName: u.fullName,
    phoneNumber: u.phoneNumber,
    role: u.role,
    status: u.status,
    passwordHash: defaultPasswordHash,
  }));

  await db
    .insert(users)
    .values(usersToInsert)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        role: users.role,
        status: users.status,
        passwordHash: defaultPasswordHash,
      },
    });

  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      fullName: users.fullName,
    })
    .from(users);
}

/**
 * Coordinates and executes Tier 1 Master Reference seeding across active scopes.
 *
 * @param db - Drizzle database client instance
 * @param scopes - Active normalized seeding scopes
 * @returns Aggregate result containing seeded reference entities
 */
export async function seedTier1Reference(
  db: DrizzleDB,
  scopes: SeedScope[] = ["all"],
): Promise<Tier1SeedResult> {
  const result: Tier1SeedResult = {
    genres: [],
    seatTypes: [],
    users: [],
  };

  const shouldSeedGenres = isScopeActive(scopes, "reference", "genres");
  const shouldSeedSeatTypes = isScopeActive(scopes, "reference", "seat-types");
  const shouldSeedUsers = isScopeActive(scopes, "reference", "users");

  if (shouldSeedGenres) {
    result.genres = await seedGenres(db);
  }

  if (shouldSeedSeatTypes) {
    result.seatTypes = await seedSeatTypes(db);
  }

  if (shouldSeedUsers) {
    result.users = await seedUsers(db);
  }

  return result;
}
