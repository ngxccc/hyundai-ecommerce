import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { productService } from "@nhatnang/database/services";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 100;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const brandId = searchParams.get("brandId") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    // Fetch products dynamically using ProductService
    const { data: dbProducts } = await productService.getAll(limit, {
      categoryId,
      brandId,
      search,
    });

    return NextResponse.json(
      {
        status: true,
        data: dbProducts,
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
