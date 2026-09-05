import { NextResponse, type NextRequest } from "next/server";
import { HTTP_STATUS } from "@/shared/constants";
import { adminApiClient } from "@/lib/api-client";
import { requireAuth } from "@/shared/lib/action-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const backendRes = await adminApiClient.quotes.exportExcel(id);
    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: backendRes.status,
            detail: "Quote Excel export failed",
          },
        },
        { status: backendRes.status },
      );
    }

    const buffer = await backendRes.arrayBuffer();
    const disposition =
      backendRes.headers.get("content-disposition") ??
      `attachment; filename="Bao-Gia-Hyundai-${id.slice(0, 8)}.xlsx"`;

    return new NextResponse(buffer, {
      status: HTTP_STATUS.OK,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[QuoteExcelRoute]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          detail: "Failed to download quote excel file",
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
