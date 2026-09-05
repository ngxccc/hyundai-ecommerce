import { NextResponse, type NextRequest } from "next/server";
import { HTTP_STATUS } from "@/shared/constants";
import { api } from "@/lib/api-client";
import { requireAuth } from "@/shared/lib/action-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const { response } = await api.GET("/quotes/{id}/export-excel", {
      params: { path: { id } },
      parseAs: "arrayBuffer",
    });
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: response.status,
            detail: "Quote Excel export failed",
          },
        },
        { status: response.status },
      );
    }

    const buffer = await response.arrayBuffer();
    const disposition =
      response.headers.get("content-disposition") ??
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
