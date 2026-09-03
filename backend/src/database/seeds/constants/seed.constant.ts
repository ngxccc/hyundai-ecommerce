import { hashPassword } from "@/common/utils/crypto.util";

/**
 * Default password assigned to all pre-seeded test and system accounts.
 */
export const DEFAULT_SEED_PASSWORD = "Password123!@#";

let cachedSeedPasswordHash: string | undefined;

/**
 * Retrieves the salted Scrypt password hash for the default seed password.
 * Memoizes the computed hash in memory so all seeded users share the same hash computation.
 *
 * @returns Salted Scrypt password hash string
 */
export async function getSeedPasswordHash(): Promise<string> {
  cachedSeedPasswordHash ??= await hashPassword(DEFAULT_SEED_PASSWORD);
  return cachedSeedPasswordHash;
}

/**
 * Standard daily showtime slot times (Asia/Ho_Chi_Minh UTC+7).
 */
export const STANDARD_SHOW_SLOTS = [
  "09:30",
  "13:00",
  "16:30",
  "19:45",
  "22:15",
] as const;

/**
 * Valid atomic scope arguments supported by the database seeding engine.
 */
export const SEED_SCOPES = [
  "all",
  "reference",
  "catalog",
  "schedule",
  "genres",
  "seat-types",
  "users",
  "cinemas",
  "movies",
  "shows",
] as const;

export type SeedScope = (typeof SEED_SCOPES)[number];

/**
 * Parses and normalizes single string, comma-separated string, or array of scopes into a unique array of SeedScope.
 *
 * @param input - Raw scope parameter from CLI or API
 * @returns Cleaned array of unique, validated SeedScope values
 * @throws Error if an unrecognized scope is encountered
 */
export function normalizeSeedScopes(
  input?: SeedScope | SeedScope[] | (string & {}),
): SeedScope[] {
  if (!input) {
    return ["all"];
  }

  const rawList = Array.isArray(input) ? input : input.split(",");
  const normalized: SeedScope[] = [];

  for (const item of rawList) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (!SEED_SCOPES.includes(trimmed as SeedScope)) {
      throw new Error(
        `Invalid seeding scope: "${trimmed}". Allowed scopes are: ${SEED_SCOPES.join(", ")}`,
      );
    }

    if (!normalized.includes(trimmed as SeedScope)) {
      normalized.push(trimmed as SeedScope);
    }
  }

  return normalized.length === 0 ? ["all"] : normalized;
}

/**
 * Evaluates whether any of the target scopes match the active scope list (handling 'all' wildcard).
 *
 * @param activeScopes - Normalized active scopes
 * @param targets - Scopes required for a specific execution block
 * @returns true if 'all' is present or any target matches activeScopes
 */
export function isScopeActive(
  activeScopes: SeedScope[],
  ...targets: SeedScope[]
): boolean {
  if (activeScopes.includes("all")) {
    return true;
  }
  return targets.some((target) => activeScopes.includes(target));
}
