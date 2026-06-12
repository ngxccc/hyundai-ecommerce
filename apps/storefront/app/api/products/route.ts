import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { productService, categoryService, brandService } from "@/shared/services";
import type { TGetAllOptions } from "@nhatnang/database/services";
import { connection, NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? Number(limitParam) : 100;
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 100;
    const categorySlug = searchParams.get("category") ?? undefined;
    const brandParam = searchParams.get("brand") ?? undefined;
    const search = searchParams.get("q") ?? undefined;
    const sort =
      (searchParams.get("sort") as TGetAllOptions["sort"]) ?? undefined;
    const after = searchParams.get("after") ?? undefined;
    const before = searchParams.get("before") ?? undefined;

    const fuelType = searchParams.get("fuelType") ?? undefined;
    const phase = searchParams.get("phase") ?? undefined;
    const voltageParam = searchParams.get("voltage");
    const voltage = voltageParam ? Number(voltageParam) : undefined;
    const minPowerParam = searchParams.get("minPower");
    const minPower = minPowerParam ? Number(minPowerParam) : undefined;
    const maxPowerParam = searchParams.get("maxPower");
    const maxPower = maxPowerParam ? Number(maxPowerParam) : undefined;
    const engineBrand = searchParams.get("engineBrand") ?? undefined;
    const alternatorBrand = searchParams.get("alternatorBrand") ?? undefined;
    const isQuoteOnlyParam = searchParams.get("isQuoteOnly");
    const isQuoteOnly = isQuoteOnlyParam === "true" ? true : undefined;

    // Resolve categoryIds if category slug is provided
    let categoryIds: string[] | undefined;
    if (categorySlug) {
      const categoriesList = await categoryService.getCategories();
      const targetCategory = categoriesList.find(
        (cat) => cat.slug === categorySlug,
      );
      if (targetCategory) {
        categoryIds = await categoryService.getCategoryDescendants(
          targetCategory.id,
        );
      }
    }

    // Resolve brandIds from brand slugs in URL query parameter
    let brandIds: string[] | undefined;
    if (brandParam) {
      const brandSlugs = brandParam.split(",").filter(Boolean);
      const allBrands = await brandService.getBrands();
      brandIds = allBrands
        .filter((b) => brandSlugs.includes(b.slug))
        .map((b) => b.id);
    }

    // Fetch products dynamically using cached local ProductService
    const resData = await productService.getProducts(limit, {
      categoryIds,
      brandIds,
      search,
      sort,
      after,
      before,
      fuelType,
      phase,
      voltage,
      minPower,
      maxPower,
      engineBrand,
      alternatorBrand,
      isQuoteOnly,
    });

    return NextResponse.json(
      {
        status: true,
        data: resData,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error("Error fetching products in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
