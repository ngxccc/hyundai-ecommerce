import { NextResponse, type NextRequest } from "next/server";
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
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 },
      );
    }

    const excelBuffer = await generateQuoteExcelWorkbook(quote);
    const fileName = `Bao-Gia-Hyundai-${quote.quoteNumber ?? id.slice(0, 8)}.xlsx`;
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[QuoteExcelRoute]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate quote excel file" },
      { status: 500 },
    );
  }
}
