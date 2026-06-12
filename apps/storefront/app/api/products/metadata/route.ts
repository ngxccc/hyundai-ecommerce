import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { productService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const metadata = await productService.getFiltersMetadata();
    return NextResponse.json(
      {
        status: true,
        data: metadata,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error("Error fetching products metadata in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
