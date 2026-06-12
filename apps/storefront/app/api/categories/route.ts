import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { categoryService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dbCategories = await categoryService.getCategories();

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
        data: [],
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
