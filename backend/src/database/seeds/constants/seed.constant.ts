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
  return (cachedSeedPasswordHash ??= await hashPassword(DEFAULT_SEED_PASSWORD));
}

/**
 * Valid atomic scope arguments supported by the database seeding engine.
 */
export const SEED_SCOPES = [
  "all",
  "reference",
  "dealer-tiers",
  "users",
  "catalog",
  "brands",
  "categories",
  "products",
  "warehouses",
  "operational",
  "quotes",
  "orders",
] as const;

export type SeedScope = (typeof SEED_SCOPES)[number];

/**
 * Parses and normalizes single string, comma-separated string, or array of scopes into a unique array of SeedScope.
 * Throws an explicit Error with descriptive feedback if any unrecognized scope is encountered.
 *
 * @param input - Raw scope string, comma-delimited string, or array of scope tokens
 * @returns Deduplicated array of valid SeedScope tokens
 */
export function normalizeSeedScopes(
  input?: SeedScope | SeedScope[] | (string & {}),
): SeedScope[] {
  if (!input) {
    return ["all"];
  }

  const rawTokens = Array.isArray(input) ? input : String(input).split(",");

  const cleaned = rawTokens
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is string => s.length > 0);

  if (cleaned.length === 0) {
    return ["all"];
  }

  const validSet = new Set<string>(SEED_SCOPES);
  const normalized: SeedScope[] = [];

  for (const token of cleaned) {
    if (!validSet.has(token)) {
      throw new Error(
        `Invalid seed scope "${token}". Valid scopes: ${SEED_SCOPES.join(", ")}`,
      );
    }
    normalized.push(token as SeedScope);
  }

  return [...new Set(normalized)];
}

/**
 * Evaluates whether any of the target scopes match the active scope list (handling 'all' wildcard).
 *
 * @param activeScopes - Normalized list of requested seed scopes
 * @param targets - Target scopes required to execute a specific tier
 * @returns True if 'all' is present or at least one target scope is explicitly active
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
