import { categoryService } from "@nhatnang/database/services";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    // Fetch categories using CategoryService
    const dbCategories = await categoryService.getAll();

    // Map DB categories to storefront Category schema
    const mappedCategories = dbCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      imageUrl: c.image || "",
      description: c.description || "",
    }));

    return NextResponse.json(
      {
        status: true,
        data: mappedCategories,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching categories in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: 500 },
    );
  }
}
