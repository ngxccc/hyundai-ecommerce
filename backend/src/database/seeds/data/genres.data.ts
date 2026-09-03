import type { NewGenre } from "@/database/schemas";

/**
 * Master catalog genres populated during Tier 1 database seeding.
 */
export const MASTER_GENRES: Omit<NewGenre, "id">[] = [
  { name: "Action" },
  { name: "Comedy" },
  { name: "Drama" },
  { name: "Horror" },
  { name: "Romance" },
  { name: "Sci-Fi" },
  { name: "Animation" },
  { name: "Thriller" },
];
