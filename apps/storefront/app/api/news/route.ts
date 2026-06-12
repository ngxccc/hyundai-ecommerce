import { newsService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await newsService.getLatest();
    return NextResponse.json(
      { status: true, data },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ status: false, data: [] }, { status: 500 });
  }
}
