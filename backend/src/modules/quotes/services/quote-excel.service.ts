import { Injectable } from "@nestjs/common";
import { Workbook, type Borders } from "exceljs";
import { numberToVietnameseWords } from "@/common/utils/number-to-words.util";
import type { QuoteResponseDto } from "../dto/quote-response.dto";

/**
 * Helper to convert row objects or row indices to strings for formula & cell reference interpolation.
 */
const rn = (rowOrNum: { number: number } | number): string =>
  typeof rowOrNum === "number" ? String(rowOrNum) : String(rowOrNum.number);

/**
 * Service generating formatted corporate Excel (.xlsx) quotations matching B2B commercial templates.
 */
@Injectable()
export class QuoteExcelService {
  /**
   * Generates a corporate Excel spreadsheet (.xlsx) for a quote using ExcelJS.
   *
   * @param quote - Full quote record with customer info, line items, and terms.
   * @returns Binary Buffer containing the generated .xlsx workbook.
   */
  async generateQuoteExcelWorkbook(quote: QuoteResponseDto): Promise<Buffer> {
    const workbook = new Workbook();
    workbook.creator = "Hyundai Power Products Vietnam - Nhat Nang";
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheetName = (quote.quoteNumber ?? "Bao_Gia")
      .replace(/[/\\?*:[\]]/g, "_")
      .slice(0, 31);

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
      pageSetup: {
        paperSize: 9, // A4
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.6,
          bottom: 0.6,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    // 1. Column Specifications
    worksheet.columns = [
      { key: "stt", width: 6 }, // A: Index
      { key: "name", width: 34 }, // B: Equipment / Model name
      { key: "specs", width: 40 }, // C: Technical specifications
      { key: "unit", width: 10 }, // D: Unit of measurement
      { key: "qty", width: 10 }, // E: Quantity
      { key: "unitPrice", width: 18 }, // F: Unit price (VND)
      { key: "discount", width: 12 }, // G: Discount rate (%)
      { key: "total", width: 22 }, // H: Line total (VND)
    ];

    // Common Borders
    const thinBorder: Partial<Borders> = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    const headerBorder: Partial<Borders> = {
      top: { style: "medium", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };

    // 2. Corporate Header Block
    const titleRow1 = worksheet.addRow(["HYUNDAI POWER PRODUCTS - NHẬT NĂNG"]);
    worksheet.mergeCells(`A${rn(titleRow1)}:H${rn(titleRow1)}`);
    titleRow1.getCell(1).font = {
      name: "Arial",
      size: 13,
      bold: true,
      color: { argb: "FF002C6C" },
    };
    titleRow1.alignment = { vertical: "middle", horizontal: "left" };

    const titleRow2 = worksheet.addRow([
      "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
    ]);
    worksheet.mergeCells(`A${rn(titleRow2)}:H${rn(titleRow2)}`);
    titleRow2.getCell(1).font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FF1E293B" },
    };

    const titleRow3 = worksheet.addRow([
      "Địa chỉ: 310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. HCM | Hotline: 0901.49.7771 | MST: 0316447814",
    ]);
    worksheet.mergeCells(`A${rn(titleRow3)}:H${rn(titleRow3)}`);
    titleRow3.getCell(1).font = {
      name: "Arial",
      size: 9,
      italic: true,
      color: { argb: "FF64748B" },
    };

    worksheet.addRow([]); // Blank Row

    // 3. Document Main Banner
    const bannerRow = worksheet.addRow([
      "BẢNG BÁO GIÁ THIẾT BỊ MÁY PHÁT ĐIỆN & DỊCH VỤ KỸ THUẬT",
    ]);
    worksheet.mergeCells(`A${rn(bannerRow)}:H${rn(bannerRow)}`);
    bannerRow.height = 30;
    const bannerCell = bannerRow.getCell(1);
    bannerCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    bannerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF002C6C" },
    };
    bannerCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.addRow([]); // Blank Row

    // 4. Customer Information & Quote Metadata Grid
    const terms = quote.commercialTerms;
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    };

    const metaStartRow = worksheet.rowCount + 1;

    const rowA = worksheet.addRow([
      "Kính gửi:",
      quote.customerName ?? "---",
      "",
      "",
      "",
      "Số báo giá:",
      quote.quoteNumber ?? `#${quote.id.slice(0, 8)}`,
      "",
    ]);
    worksheet.mergeCells(`B${rn(rowA)}:E${rn(rowA)}`);
    worksheet.mergeCells(`G${rn(rowA)}:H${rn(rowA)}`);

    const rowB = worksheet.addRow([
      "Đơn vị/Công ty:",
      quote.companyName ?? "Khách hàng cá nhân",
      "",
      "",
      "",
      "Ngày phát hành:",
      formatDate(quote.createdAt),
      "",
    ]);
    worksheet.mergeCells(`B${rn(rowB)}:E${rn(rowB)}`);
    worksheet.mergeCells(`G${rn(rowB)}:H${rn(rowB)}`);

    const rowC = worksheet.addRow([
      "Điện thoại / Email:",
      `${quote.customerPhone ?? "---"} / ${quote.customerEmail ?? "---"}`,
      "",
      "",
      "",
      "Thời hạn hiệu lực:",
      `${String(terms?.validityDays ?? 15)} ngày`,
      "",
    ]);
    worksheet.mergeCells(`B${rn(rowC)}:E${rn(rowC)}`);
    worksheet.mergeCells(`G${rn(rowC)}:H${rn(rowC)}`);

    const rowD = worksheet.addRow([
      "Địa chỉ công trình:",
      quote.shippingAddress ?? "Tại kho bên bán hoặc chân công trình",
      "",
      "",
      "",
      "Mã số thuế:",
      quote.taxId ?? "---",
      "",
    ]);
    worksheet.mergeCells(`B${rn(rowD)}:E${rn(rowD)}`);
    worksheet.mergeCells(`G${rn(rowD)}:H${rn(rowD)}`);

    const metaEndRow = worksheet.rowCount;

    for (let r = metaStartRow; r <= metaEndRow; r++) {
      const row = worksheet.getRow(r);
      row.font = { name: "Arial", size: 9.5 };
      row.getCell(1).font = { name: "Arial", size: 9.5, bold: true };
      row.getCell(6).font = { name: "Arial", size: 9.5, bold: true };
      row.getCell(7).font = {
        name: "Arial",
        size: 9.5,
        bold: true,
        color: { argb: "FF002C6C" },
      };
    }

    worksheet.addRow([]); // Blank Row

    // 5. Line Items Table Header
    const tableHeaderRow = worksheet.addRow([
      "STT",
      "Tên Thiết Bị / Model",
      "Quy Cách & Thông Số Kỹ Thuật",
      "ĐVT",
      "Số Lượng",
      "Đơn Giá (VNĐ)",
      "Chiết Khấu",
      "Thành Tiền (VNĐ)",
    ]);
    tableHeaderRow.height = 26;

    tableHeaderRow.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 9.5,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = headerBorder;
    });

    // 6. Data Rows
    const itemsStartRow = worksheet.rowCount + 1;

    for (const [i, item] of quote.items.entries()) {
      const unitPrice = parseFloat(item.unitPrice ?? "0");
      const discountPercent = parseFloat(item.discountPercent ?? "0");
      const finalUnitPrice = unitPrice * (1 - discountPercent / 100);
      const calculatedTotal = finalUnitPrice * item.quantity;

      const specsText =
        item.itemSpecs ??
        (item.product
          ? `Model: ${item.product.slug}`
          : "Tiêu chuẩn nhà sản xuất");

      const row = worksheet.addRow([
        i + 1, // A: Index
        item.itemName ?? item.product?.nameVi ?? "Thiết bị", // B: Name
        specsText, // C: Specs
        "Bộ", // D: Unit
        item.quantity, // E: Quantity
        unitPrice, // F: Unit price
        discountPercent > 0 ? `${String(discountPercent)}%` : "-", // G: Discount
        calculatedTotal, // H: Line total
      ]);

      row.height = 24;
      row.font = { name: "Arial", size: 9 };

      // STT, ĐVT, Qty, Discount -> Centered
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      row.getCell(4).alignment = { vertical: "middle", horizontal: "center" };
      row.getCell(5).alignment = { vertical: "middle", horizontal: "center" };
      row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };

      // Name & Specs -> Left aligned
      row.getCell(2).alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };
      row.getCell(3).alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
      };

      // Currency columns -> Right aligned with format
      row.getCell(6).numFmt = '#,##0 "VND"';
      row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };

      row.getCell(8).numFmt = '#,##0 "VND"';
      row.getCell(8).alignment = { vertical: "middle", horizontal: "right" };
      row.getCell(8).font = { name: "Arial", size: 9, bold: true };

      row.eachCell((cell) => {
        cell.border = thinBorder;
      });
    }

    const itemsEndRow = worksheet.rowCount;

    // 7. Summary & Total Rows
    const vatRate = quote.vatRate ?? 10;
    const subtotalPrice = parseFloat(quote.subtotalPrice ?? "0");
    const vatAmount = parseFloat(quote.vatAmount ?? "0");
    const grandTotal = parseFloat(quote.totalQuotedPrice ?? "0");

    // 7.1 Subtotal Row
    const subtotalRowNum = worksheet.rowCount + 1;
    const subtotalRow = worksheet.addRow([
      "CỘNG TIỀN HÀNG TRƯỚC THUẾ (SUBTOTAL):",
      "",
      "",
      "",
      "",
      "",
      "",
      {
        formula: `SUM(H${rn(itemsStartRow)}:H${rn(itemsEndRow)})`,
        result: subtotalPrice,
      },
    ]);
    worksheet.mergeCells(`A${rn(subtotalRowNum)}:G${rn(subtotalRowNum)}`);
    subtotalRow.height = 22;
    subtotalRow.font = { name: "Arial", size: 9.5, bold: true };
    subtotalRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
    subtotalRow.getCell(8).numFmt = '#,##0 "VND"';
    subtotalRow.getCell(8).alignment = {
      vertical: "middle",
      horizontal: "right",
    };
    subtotalRow.eachCell((cell) => {
      cell.border = thinBorder;
    });

    // 7.2 VAT Row
    const vatRowNum = worksheet.rowCount + 1;
    const vatRow = worksheet.addRow([
      `THUẾ GIÁ TRỊ GIA TĂNG (VAT ${String(vatRate)}%):`,
      "",
      "",
      "",
      "",
      "",
      "",
      {
        formula: `H${rn(subtotalRowNum)}*${String(vatRate)}/100`,
        result: vatAmount,
      },
    ]);
    worksheet.mergeCells(`A${rn(vatRowNum)}:G${rn(vatRowNum)}`);
    vatRow.height = 22;
    vatRow.font = { name: "Arial", size: 9.5, bold: true };
    vatRow.getCell(1).alignment = { vertical: "middle", horizontal: "right" };
    vatRow.getCell(8).numFmt = '#,##0 "VND"';
    vatRow.getCell(8).alignment = { vertical: "middle", horizontal: "right" };
    vatRow.eachCell((cell) => {
      cell.border = thinBorder;
    });

    // 7.3 Grand Total Row
    const grandTotalRowNum = worksheet.rowCount + 1;
    const grandTotalRow = worksheet.addRow([
      "TỔNG CỘNG TIỀN THANH TOÁN (GRAND TOTAL):",
      "",
      "",
      "",
      "",
      "",
      "",
      {
        formula: `H${rn(subtotalRowNum)}+H${rn(vatRowNum)}`,
        result: grandTotal,
      },
    ]);
    worksheet.mergeCells(`A${rn(grandTotalRowNum)}:G${rn(grandTotalRowNum)}`);
    grandTotalRow.height = 26;
    grandTotalRow.font = {
      name: "Arial",
      size: 10.5,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    const grandLabelCell = grandTotalRow.getCell(1);
    grandLabelCell.alignment = { vertical: "middle", horizontal: "right" };
    grandLabelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF002C6C" },
    };

    const grandValueCell = grandTotalRow.getCell(8);
    grandValueCell.alignment = { vertical: "middle", horizontal: "right" };
    grandValueCell.numFmt = '#,##0 "VND"';
    grandValueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF002C6C" },
    };
    grandTotalRow.eachCell((cell) => {
      cell.border = headerBorder;
    });

    // 7.4 Amount In Words Row
    const wordsRowNum = worksheet.rowCount + 1;
    const wordsRow = worksheet.addRow([
      `Số tiền viết bằng chữ: ${numberToVietnameseWords(grandTotal)}`,
    ]);
    worksheet.mergeCells(`A${rn(wordsRowNum)}:H${rn(wordsRowNum)}`);
    wordsRow.height = 22;
    const wordsCell = wordsRow.getCell(1);
    wordsCell.font = { name: "Arial", size: 9.5, italic: true, bold: true };
    wordsCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    wordsCell.alignment = { vertical: "middle", horizontal: "left" };
    wordsRow.eachCell((cell) => {
      cell.border = thinBorder;
    });

    worksheet.addRow([]); // Blank Row

    // 8. Commercial Terms & Technical Policies
    const termsTitleRow = worksheet.addRow([
      "ĐIỀU KHOẢN THƯƠNG MẠI & DỊCH VỤ KỸ THUẬT:",
    ]);
    worksheet.mergeCells(`A${rn(termsTitleRow)}:H${rn(termsTitleRow)}`);
    termsTitleRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      bold: true,
      underline: true,
      color: { argb: "FF0F172A" },
    };

    const addTermLine = (text: string) => {
      const row = worksheet.addRow([text]);
      worksheet.mergeCells(`A${rn(row)}:H${rn(row)}`);
      row.getCell(1).font = { name: "Arial", size: 9 };
      row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
    };

    addTermLine(
      `1. Thời gian giao hàng: ${terms?.deliveryTime ?? "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng."}`,
    );
    addTermLine(
      `2. Địa điểm giao nhận: ${terms?.deliveryLocation ?? quote.shippingAddress ?? "Giao hàng và hỗ trợ kỹ thuật tại địa chỉ công trình bên mua."}`,
    );
    addTermLine(
      `3. Phương thức thanh toán: ${terms?.paymentSchedule ?? "Chuyển khoản: Tạm ứng 30% khi ký hợp đồng, 70% còn lại sau khi bàn giao và nghiệm thu."}`,
    );
    addTermLine(
      `4. Chính sách bảo hành: ${terms?.warrantyTerms ?? "Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy máy tùy điều kiện nào đến trước theo tiêu chuẩn Hyundai."}`,
    );
    if (quote.note) {
      addTermLine(`5. Ghi chú bổ sung: ${quote.note}`);
    }

    worksheet.addRow([]); // Blank Row

    // 9. Signatures Block
    const sigTitleRow = worksheet.addRow([
      "",
      "ĐẠI DIỆN BÊN MUA",
      "",
      "",
      "",
      "ĐẠI DIỆN BÊN BÁN - NHẬT NĂNG",
      "",
      "",
    ]);
    worksheet.mergeCells(`B${rn(sigTitleRow)}:D${rn(sigTitleRow)}`);
    worksheet.mergeCells(`F${rn(sigTitleRow)}:H${rn(sigTitleRow)}`);
    sigTitleRow.font = { name: "Arial", size: 9.5, bold: true };
    sigTitleRow.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    sigTitleRow.getCell(6).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    const sigSubRow = worksheet.addRow([
      "",
      "(Ký, ghi rõ họ tên và đóng dấu)",
      "",
      "",
      "",
      "(Ký, ghi rõ họ tên và đóng dấu)",
      "",
      "",
    ]);
    worksheet.mergeCells(`B${rn(sigSubRow)}:D${rn(sigSubRow)}`);
    worksheet.mergeCells(`F${rn(sigSubRow)}:H${rn(sigSubRow)}`);
    sigSubRow.font = { name: "Arial", size: 8.5, italic: true };
    sigSubRow.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    sigSubRow.getCell(6).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    const sigNameRow = worksheet.addRow([
      "",
      quote.customerName ?? "---",
      "",
      "",
      "",
      "GIÁM ĐỐC KINH DOANH",
      "",
      "",
    ]);
    worksheet.mergeCells(`B${rn(sigNameRow)}:D${rn(sigNameRow)}`);
    worksheet.mergeCells(`F${rn(sigNameRow)}:H${rn(sigNameRow)}`);
    sigNameRow.font = { name: "Arial", size: 9.5, bold: true };
    sigNameRow.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    sigNameRow.getCell(6).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // 10. Generate Buffer
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
