import type {
  ProductFuelType,
  ProductPhase,
  ProductQueryParams,
  ProductSort,
} from "@/types/api";

type RawSearchParams = Record<string, string | string[] | undefined>;

function getString(val: string | string[] | undefined): string | undefined {
  if (typeof val === "string" && val.trim() !== "") {
    return val.trim();
  }
  return undefined;
}

function getNumber(val: string | string[] | undefined): number | undefined {
  const str = getString(val);
  if (!str) return undefined;
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

/**
 * Cleanly extracts and validates ProductQueryParams from Next.js raw URL searchParams.
 */
export function parseProductQueryParams(
  params: RawSearchParams,
): ProductQueryParams {
  const page = getNumber(params.page) ?? 1;
  const limit = getNumber(params.limit) ?? 20;
  const minPower = getNumber(params.minPower);
  const maxPower = getNumber(params.maxPower);
  const voltage = getString(params.voltage);

  return {
    page,
    limit,
    search: getString(params.search),
    categoryId: getString(params.categoryId),
    brandId: getString(params.brandId),
    fuelType: getString(params.fuelType) as ProductFuelType,
    phase: getString(params.phase) as ProductPhase,
    voltage: voltage != null ? String(voltage) : undefined,
    minPower: minPower != null && !isNaN(minPower) ? minPower : undefined,
    maxPower: maxPower != null && !isNaN(maxPower) ? maxPower : undefined,
    engineBrand: getString(params.engineBrand),
    alternatorBrand: getString(params.alternatorBrand),
    status: getString(params.status) as ProductQueryParams["status"],
    sort: getString(params.sort) as ProductSort,
    isQuoteOnly: params.isQuoteOnly === "true" ? true : undefined,
  };
}
