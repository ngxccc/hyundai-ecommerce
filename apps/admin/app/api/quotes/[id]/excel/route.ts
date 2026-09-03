import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@nhatnang/shared";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { quotesService } from "@nhatnang/database/services";
import { requireAuth } from "@/shared/lib/action-auth";
import { generateQuoteExcelWorkbook } from "@/features/quotes/services/quote-excel.service";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;

    const quote = await quotesService.getComplexQuote(id);
    if (!quote) {
      return jsonError({
        status: HTTP_STATUS.NOT_FOUND,
        detail: "Quote not found",
        instance: `/api/quotes/${id}/excel`,
      });
    }

    const excelBuffer = await generateQuoteExcelWorkbook(quote);
    const fileName = `Bao-Gia-Hyundai-${quote.quoteNumber ?? id.slice(0, 8)}.xlsx`;
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: HTTP_STATUS.OK,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[QuoteExcelRoute]", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Failed to generate quote excel file",
      instance: "/api/quotes/[id]/excel",
    });
  }
}
