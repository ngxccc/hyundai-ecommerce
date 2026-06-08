import { productService } from "@nhatnang/database/services";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 100;
    const categoryId = searchParams.get("categoryId") || undefined;
    const brandId = searchParams.get("brandId") || undefined;
    const search = searchParams.get("search") || undefined;

    // Fetch products dynamically using ProductService
    const { data: dbProducts } = await productService.getAll(limit, {
      categoryId,
      brandId,
      search,
    });

    // Map DB products to storefront Product schema
    const mappedProducts = dbProducts.map((p) => {
      const specsArray: string[] = [];
      if (p.specs && typeof p.specs === "object") {
        const specsObj = p.specs as Record<string, any>;
        if (specsObj["power"]) specsArray.push(`${specsObj["power"]}kW`);
        if (specsObj["fuelType"]) specsArray.push(specsObj["fuelType"]);
      }

      return {
        id: p.id,
        model: p.slug, // Map slug to model
        name: p.name,
        specs: specsArray,
        price: Number(p.price),
        imageUrl: p.images[0] || "",
      };
    });

    return NextResponse.json(
      {
        status: true,
        data: mappedProducts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: 500 },
    );
  }
}
