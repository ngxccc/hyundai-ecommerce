import { delay } from "@/shared/lib/utils";
import { BUILD_TIME_PRODUCTS } from "@/shared/constants/products";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    // Mock data - Mốt thay cái này bằng logic: await db.products.findMany()
    await delay(500);

    return NextResponse.json(
      {
        status: true,
        data: BUILD_TIME_PRODUCTS,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: 500 },
    );
  }
}
