import { promoService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const activePromo = await promoService.getPromos();

    return NextResponse.json(
      {
        status: true,
        data: activePromo,
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
