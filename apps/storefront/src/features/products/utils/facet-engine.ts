import type { StorefrontFilterMetadata } from "@/shared/services";
import { FUEL_TYPES, PHASES } from "@nhatnang/database/validators";
import type {
  ComputeFacetsParams,
  FacetStatus,
  ProductActiveFilters,
} from "../types/facet-engine";

/**
 * Computes the enabled/disabled state for each filter option based on client-side products metadata.
 * Follows strict faceted search logic:
 * - A filter option within category X is computed by applying all active filters EXCEPT those in category X.
 * - Options that are currently active (selected) must always remain enabled so they can be deselected.
 */
export function computeFacets(params: ComputeFacetsParams): FacetStatus {
  const { products, brands, categories, activeFilters } = params;

  const result: FacetStatus = {
    categories: {},
    brands: {},
    fuelTypes: {},
    phases: {},
  };

  categories.forEach((c) => (result.categories[c.slug] = false));
  brands.forEach((b) => (result.brands[b.slug] = false));
  FUEL_TYPES.forEach((f) => (result.fuelTypes[f] = false));
  PHASES.forEach((p) => (result.phases[p] = false));

  let activeCategoryIds = null;
  if (activeFilters.categorySlug) {
    const activeCat = categories.find(
      (c) => c.slug === activeFilters.categorySlug,
    );
    if (activeCat)
      activeCategoryIds = getDescendantCategoryIds(activeCat.id, categories);
  }

  const selectedBrandIds = brands
    .filter((b) => activeFilters.brandSlugs.includes(b.slug))
    .map((b) => b.id);

  const matchStates = products.map((p) => {
    const matchCat = matchesCategory(p, activeCategoryIds);
    const matchBrand = matchesBrands(p, selectedBrandIds);
    const matchFuel =
      activeFilters.fuelType === null ||
      p.specs?.["fuelType"] === activeFilters.fuelType;
    const matchPhase =
      activeFilters.phase === null || p.specs?.["phase"] === activeFilters.phase;
    const matchBaseSpecs = matchesSpecsBase(p, activeFilters);
    const matchSearchQuery = matchesSearch(p, activeFilters.q);

    return {
      product: p,
      matchCat,
      matchBrand,
      matchFuel,
      matchPhase,
      matchBaseSpecs,
      matchSearchQuery,
    };
  });

  brands.forEach((b) => {
    if (activeFilters.brandSlugs.includes(b.slug)) {
      result.brands[b.slug] = true;
      return;
    }
    result.brands[b.slug] = matchStates.some(
      (m) => m.product.brandId === b.id && isMatchExcept(m, "brand"),
    );
  });

  categories.forEach((c) => {
    if (c.slug === activeFilters.categorySlug) {
      result.categories[c.slug] = true;
      return;
    }
    const descendantIds = getDescendantCategoryIds(c.id, categories);
    result.categories[c.slug] = matchStates.some(
      (m) =>
        m.product.categoryId !== null &&
        descendantIds.includes(m.product.categoryId) &&
        isMatchExcept(m, "category"),
    );
  });

  FUEL_TYPES.forEach((f) => {
    if (f === activeFilters.fuelType) {
      result.fuelTypes[f] = true;
      return;
    }
    result.fuelTypes[f] = matchStates.some(
      (m) => m.product.specs?.["fuelType"] === f && isMatchExcept(m, "fuelType"),
    );
  });

  PHASES.forEach((ph) => {
    if (ph === activeFilters.phase) {
      result.phases[ph] = true;
      return;
    }
    result.phases[ph] = matchStates.some(
      (m) => m.product.specs?.["phase"] === ph && isMatchExcept(m, "phase"),
    );
  });

  return result;
}

// DFS Stack
function getDescendantCategoryIds(
  targetId: string,
  categories: ComputeFacetsParams["categories"],
) {
  const childrenByParent = new Map<string, string[]>();

  for (const cat of categories) {
    if (cat.parentId === null) continue;

    const siblings = childrenByParent.get(cat.parentId) ?? [];
    siblings.push(cat.id);
    childrenByParent.set(cat.parentId, siblings);
  }

  const results = [];
  const stack = [targetId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const currentId = stack.pop()!;

    if (visited.has(currentId)) continue;

    visited.add(currentId);
    results.push(currentId);

    const children = childrenByParent.get(currentId);
    if (children) stack.push(...children);
  }

  return results;
}

function matchesCategory(
  product: StorefrontFilterMetadata,
  activeCatogoryIds: string[] | null,
) {
  if (!activeCatogoryIds) return true;
  return product.categoryId
    ? activeCatogoryIds.includes(product.categoryId)
    : false;
}

function matchesBrands(
  product: StorefrontFilterMetadata,
  selectedBrandIds: string[],
) {
  if (selectedBrandIds.length === 0) return true;
  return product.brandId ? selectedBrandIds.includes(product.brandId) : false;
}

function matchesSpecsBase(
  product: StorefrontFilterMetadata,
  activeFilters: ProductActiveFilters,
) {
  const specs = product.specs;
  if (!specs) return false;

  const minPower = activeFilters.minPower;
  const maxPower = activeFilters.maxPower;
  const powerVal = typeof specs["power"] === "number" ? specs["power"] : null;

  if (minPower !== null && (powerVal === null || powerVal < minPower)) {
    return false;
  }
  if (maxPower !== null && (powerVal === null || powerVal > maxPower)) {
    return false;
  }

  const voltageVal = typeof specs["voltage"] === "number" ? specs["voltage"] : null;
  if (activeFilters.voltage !== null && voltageVal !== activeFilters.voltage) {
    return false;
  }

  if (activeFilters.engineBrand) {
    const engineBrandVal = typeof specs["engineBrand"] === "string" ? specs["engineBrand"] : "";
    const pEngine = engineBrandVal.toLowerCase();
    const filterEngine = activeFilters.engineBrand.toLowerCase();
    if (!pEngine.includes(filterEngine)) return false;
  }

  if (activeFilters.alternatorBrand) {
    const alternatorBrandVal = typeof specs["alternatorBrand"] === "string" ? specs["alternatorBrand"] : "";
    const pAlt = alternatorBrandVal.toLowerCase();
    const filterAlt = activeFilters.alternatorBrand.toLowerCase();
    if (!pAlt.includes(filterAlt)) return false;
  }

  return true;
}

function matchesSearch(
  product: ComputeFacetsParams["products"][0],
  q: string | null,
) {
  if (!q) return true;
  const searchLower = q.toLowerCase();
  const nameMatch = product.name.toLowerCase().includes(searchLower);
  const modelVal = typeof product.specs?.["model"] === "string" ? product.specs["model"] : "";
  const modelMatch = modelVal.toLowerCase().includes(searchLower);
  return nameMatch || modelMatch;
}

function isMatchExcept(
  m: {
    matchCat: boolean;
    matchBrand: boolean;
    matchFuel: boolean;
    matchPhase: boolean;
    matchBaseSpecs: boolean;
    matchSearchQuery: boolean;
  },
  excludeKey: "category" | "brand" | "fuelType" | "phase",
) {
  return (
    (excludeKey === "category" || m.matchCat) &&
    (excludeKey === "brand" || m.matchBrand) &&
    (excludeKey === "fuelType" || m.matchFuel) &&
    (excludeKey === "phase" || m.matchPhase) &&
    m.matchBaseSpecs &&
    m.matchSearchQuery
  );
}
