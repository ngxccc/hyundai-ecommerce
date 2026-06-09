import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { categoryService } from "@nhatnang/database/services";
import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const getTree = searchParams.get("tree") === "true";

    // Fetch categories using CategoryService
    const dbCategories = getTree
      ? await categoryService.getCategoryTree()
      : await categoryService.getAll();

    return NextResponse.json(
      {
        status: true,
        data: dbCategories,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error("Error fetching categories in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
