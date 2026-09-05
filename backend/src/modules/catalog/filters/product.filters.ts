import {
  and,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { products } from "@/database/schemas";
import type {
  CanopyType,
  FuelType,
  PowerPhase,
} from "@/types/product-spec.type";

/**
 * Escapes PostgreSQL ILIKE wildcard characters (%, _, \\) to prevent ReDoS and unintended full table scans.
 *
 * @param val Raw input search string
 * @returns Sanitized string with escaped wildcard characters
 */
export function escapeLikePattern(val: string): string {
  return val.replace(/[%_\\]/g, "\\$&");
}

/**
 * Composable, type-safe Drizzle filter specification helpers for product catalog discovery and faceted search.
 */
export const productFilters = {
  /**
   * Filters only active, non-deleted catalog products.
   */
  isAvailable: (): SQL | undefined =>
    and(isNull(products.deletedAt), eq(products.isActive, true)),

  /**
   * Performs cross-attribute search across product names (Vi/En), slug, and specs model.
   */
  bySearch: (search?: string | null): SQL | undefined => {
    if (!search?.trim()) {
      return undefined;
    }
    const escaped = `%${escapeLikePattern(search.trim())}%`;
    return or(
      ilike(products.nameVi, escaped),
      ilike(products.nameEn, escaped),
      ilike(products.slug, escaped),
      sql`${products.specs}->>'model' ILIKE ${escaped}`,
    );
  },

  /**
   * Filters by exact brand UUID.
   */
  byBrandId: (brandId?: string | null): SQL | undefined =>
    brandId ? eq(products.brandId, brandId) : undefined,

  /**
   * Filters by exact category UUID.
   */
  byCategoryId: (categoryId?: string | null): SQL | undefined =>
    categoryId ? eq(products.categoryId, categoryId) : undefined,

  /**
   * Filters products within the specified price range.
   */
  byPriceRange: (min?: number | null, max?: number | null): SQL | undefined => {
    const conditions: SQL[] = [];
    if (min !== undefined && min !== null) {
      conditions.push(gte(products.price, String(min)));
    }
    if (max !== undefined && max !== null) {
      conditions.push(lte(products.price, String(max)));
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
  },

  /**
   * Filters products within the specified power (kVA) rating range.
   */
  byPowerRange: (min?: number | null, max?: number | null): SQL | undefined => {
    const conditions: SQL[] = [];
    if (min !== undefined && min !== null) {
      conditions.push(sql`cast(${products.powerKva} as numeric) >= ${min}`);
    }
    if (max !== undefined && max !== null) {
      conditions.push(sql`cast(${products.powerKva} as numeric) <= ${max}`);
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
  },

  /**
   * Filters products by voltage string prefix or match.
   */
  byVoltage: (voltage?: string | null): SQL | undefined =>
    voltage?.trim()
      ? ilike(products.voltage, `%${escapeLikePattern(voltage.trim())}%`)
      : undefined,

  /**
   * Filters products by electrical phase (e.g. 1phase, 3phase).
   */
  byPhase: (phase?: PowerPhase | null): SQL | undefined =>
    phase ? eq(products.phase, phase) : undefined,

  /**
   * Filters products by engine fuel type (e.g. diesel, gasoline, gas).
   */
  byFuelType: (fuelType?: FuelType | null): SQL | undefined =>
    fuelType ? eq(products.fuelType, fuelType) : undefined,

  /**
   * Filters products by canopy acoustic enclosure type (e.g. silent, open_frame).
   */
  byCanopyType: (canopyType?: CanopyType | null): SQL | undefined =>
    canopyType ? eq(products.canopyType, canopyType) : undefined,

  /**
   * Filters products by engine brand string.
   */
  byEngineBrand: (engineBrand?: string | null): SQL | undefined =>
    engineBrand?.trim()
      ? ilike(
          products.engineBrand,
          `%${escapeLikePattern(engineBrand.trim())}%`,
        )
      : undefined,

  /**
   * Filters products by alternator brand string.
   */
  byAlternatorBrand: (alternatorBrand?: string | null): SQL | undefined =>
    alternatorBrand?.trim()
      ? ilike(
          products.alternatorBrand,
          `%${escapeLikePattern(alternatorBrand.trim())}%`,
        )
      : undefined,

  /**
   * Filters products by inventory stock status.
   */
  byStatus: (status?: string | null): SQL | undefined => {
    if (status === "outOfStock") {
      return lte(products.totalStockCache, 0);
    }
    if (status === "active" || status === "ACTIVE") {
      return and(
        eq(products.isActive, true),
        sql`${products.totalStockCache} > 0`,
      );
    }
    if (status === "INACTIVE") {
      return eq(products.isActive, false);
    }
    return undefined;
  },

  /**
   * Filters products flagged for quote-only (price is 0 or 0.00).
   */
  byQuoteOnly: (isQuoteOnly?: boolean | null): SQL | undefined => {
    if (isQuoteOnly === true) {
      return lte(products.price, "0");
    }
    if (isQuoteOnly === false) {
      return sql`cast(${products.price} as numeric) > 0`;
    }
    return undefined;
  },
};
