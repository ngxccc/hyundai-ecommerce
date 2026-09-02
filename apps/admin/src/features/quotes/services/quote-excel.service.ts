import { Workbook, type Borders } from "exceljs";
import { numberToVietnameseWords } from "@nhatnang/shared";
import type { ComplexQuote } from "@nhatnang/database/services";

/**
 * Generates a corporate Excel spreadsheet (.xlsx) for an admin quote using ExcelJS.
 * Features automated cell formatting, currency formulas, styled header/footer,
 * and comprehensive commercial terms.
 *
 * @param quote - Complex quote record with customer info, line items, and terms.
 * @returns Binary Buffer containing the generated .xlsx workbook.
 */
export async function generateQuoteExcelWorkbook(
  quote: ComplexQuote,
): Promise<Buffer> {
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
    { key: "stt", width: 6 }, // A: STT
    { key: "name", width: 34 }, // B: Tên Thiết Bị / Model
    { key: "specs", width: 40 }, // C: Quy Cách Kỹ Thuật
    { key: "unit", width: 10 }, // D: ĐVT
    { key: "qty", width: 10 }, // E: Số Lượng
    { key: "unitPrice", width: 18 }, // F: Đơn Giá (VNĐ)
    { key: "discount", width: 12 }, // G: Chiết Khấu (%)
    { key: "total", width: 22 }, // H: Thành Tiền (VNĐ)
  ];

  // Common Borders & Fills
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
  worksheet.mergeCells(`A${titleRow1.number}:H${titleRow1.number}`);
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
  worksheet.mergeCells(`A${titleRow2.number}:H${titleRow2.number}`);
  titleRow2.getCell(1).font = {
    name: "Arial",
    size: 10,
    bold: true,
    color: { argb: "FF1E293B" },
  };

  const titleRow3 = worksheet.addRow([
    "Địa chỉ: 310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. HCM | Hotline: 0901.49.7771 | MST: 0316447814",
  ]);
  worksheet.mergeCells(`A${titleRow3.number}:H${titleRow3.number}`);
  titleRow3.getCell(1).font = {
    name: "Arial",
    size: 9,
    italic: true,
    color: { argb: "FF64748B" },
  };

  worksheet.addRow([]); // Blank Row 4

  // 3. Document Main Banner
  const bannerRow = worksheet.addRow([
    "BẢNG BÁO GIÁ THIẾT BỊ MÁY PHÁT ĐIỆN & DỊCH VỤ KỸ THUẬT",
  ]);
  worksheet.mergeCells(`A${bannerRow.number}:H${bannerRow.number}`);
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

  worksheet.addRow([]); // Blank Row 6

  // 4. Customer Information & Quote Metadata Grid
  const terms = quote.commercialTerms;
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const metaStartRow = worksheet.rowCount + 1;

  const rowA = worksheet.addRow([
    "Kính gửi:",
    quote.customerName,
    "",
    "",
    "",
    "Số báo giá:",
    quote.quoteNumber ?? `#${quote.id.slice(0, 8)}`,
    "",
  ]);
  worksheet.mergeCells(`B${rowA.number}:E${rowA.number}`);
  worksheet.mergeCells(`G${rowA.number}:H${rowA.number}`);

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
  worksheet.mergeCells(`B${rowB.number}:E${rowB.number}`);
  worksheet.mergeCells(`G${rowB.number}:H${rowB.number}`);

  const rowC = worksheet.addRow([
    "Điện thoại / Email:",
    `${quote.customerPhone} / ${quote.customerEmail ?? "---"}`,
    "",
    "",
    "",
    "Thời hạn hiệu lực:",
    `${terms?.validityDays ?? 15} ngày`,
    "",
  ]);
  worksheet.mergeCells(`B${rowC.number}:E${rowC.number}`);
  worksheet.mergeCells(`G${rowC.number}:H${rowC.number}`);

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
  worksheet.mergeCells(`B${rowD.number}:E${rowD.number}`);
  worksheet.mergeCells(`G${rowD.number}:H${rowD.number}`);

  const metaEndRow = worksheet.rowCount;

  // Format Metadata cells
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

  for (let i = 0; i < quote.items.length; i++) {
    const item = quote.items[i]!;
    const unitPrice = parseFloat(item.unitPrice ?? "0");
    const discountPercent = parseFloat(item.discountPercent ?? "0");
    const finalUnitPrice = unitPrice * (1 - discountPercent / 100);
    const calculatedTotal = finalUnitPrice * item.quantity;

    // Extract specs summary
    const specsObj = item.product?.specs as Record<string, unknown> | undefined;
    const rawPower = specsObj?.["power"] ?? specsObj?.["primePowerKva"];
    const powerStr =
      typeof rawPower === "number" || typeof rawPower === "string"
        ? String(rawPower)
        : null;
    const phaseVal = specsObj?.["phase"];
    const fuelVal = specsObj?.["fuelType"];
    const engineBrandVal = specsObj?.["engineBrand"];
    const alternatorBrandVal = specsObj?.["alternatorBrand"];
    const phase =
      phaseVal === "3phase"
        ? "3 Pha 230/400V"
        : phaseVal === "1phase"
          ? "1 Pha 220V"
          : null;
    const fuel =
      fuelVal === "diesel"
        ? "Diesel"
        : fuelVal === "gasoline"
          ? "Xăng"
          : null;
    const autoSpecs = [
      powerStr ? `${powerStr}kVA` : null,
      phase,
      fuel,
      typeof engineBrandVal === "string" ? `Động cơ: ${engineBrandVal}` : null,
      typeof alternatorBrandVal === "string" ? `Đầu phát: ${alternatorBrandVal}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const finalSpecs =
      item.itemSpecs ?? (autoSpecs.length > 0 ? autoSpecs : "Theo tiêu chuẩn chính hãng");
    const displayName = item.itemModel
      ? `${item.itemName} (${item.itemModel})`
      : item.itemName;

    const rowNum = worksheet.rowCount + 1;
    // Excel formula for line total: =E{row}*F{row}*(1-G{row}/100)
    const formulaString = `E${rowNum}*F${rowNum}*(1-G${rowNum}/100)`;

    const row = worksheet.addRow([
      i + 1,
      displayName,
      finalSpecs,
      "Bộ",
      item.quantity,
      unitPrice,
      discountPercent / 100, // Stored as decimal for % format
      { formula: formulaString, result: calculatedTotal },
    ]);

    row.height = 28;
    row.font = { name: "Arial", size: 9.5 };

    // Alignments & Number formats
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    row.getCell(2).font = { name: "Arial", size: 9.5, bold: true };
    row.getCell(3).alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    row.getCell(4).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(5).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(5).font = { name: "Arial", size: 9.5, bold: true };

    row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };
    row.getCell(6).numFmt = '#,##0 "VND"';

    row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(7).numFmt = "0.0%";

    row.getCell(8).alignment = { vertical: "middle", horizontal: "right" };
    row.getCell(8).font = { name: "Arial", size: 9.5, bold: true };
    row.getCell(8).numFmt = '#,##0 "VND"';

    // Thin border on all data cells
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
      formula: `SUM(H${itemsStartRow}:H${itemsEndRow})`,
      result: subtotalPrice,
    },
  ]);
  worksheet.mergeCells(`A${subtotalRowNum}:G${subtotalRowNum}`);
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
    `THUẾ GIÁ TRỊ GIA TĂNG (VAT ${vatRate}%):`,
    "",
    "",
    "",
    "",
    "",
    "",
    {
      formula: `H${subtotalRowNum}*${vatRate}/100`,
      result: vatAmount,
    },
  ]);
  worksheet.mergeCells(`A${vatRowNum}:G${vatRowNum}`);
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
      formula: `H${subtotalRowNum}+H${vatRowNum}`,
      result: grandTotal,
    },
  ]);
  worksheet.mergeCells(`A${grandTotalRowNum}:G${grandTotalRowNum}`);
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
  worksheet.mergeCells(`A${wordsRowNum}:H${wordsRowNum}`);
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
  worksheet.mergeCells(`A${termsTitleRow.number}:H${termsTitleRow.number}`);
  termsTitleRow.getCell(1).font = {
    name: "Arial",
    size: 10,
    bold: true,
    underline: true,
    color: { argb: "FF0F172A" },
  };

  const addTermLine = (text: string) => {
    const row = worksheet.addRow([text]);
    worksheet.mergeCells(`A${row.number}:H${row.number}`);
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
  worksheet.mergeCells(`B${sigTitleRow.number}:D${sigTitleRow.number}`);
  worksheet.mergeCells(`F${sigTitleRow.number}:H${sigTitleRow.number}`);
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
  worksheet.mergeCells(`B${sigSubRow.number}:D${sigSubRow.number}`);
  worksheet.mergeCells(`F${sigSubRow.number}:H${sigSubRow.number}`);
  sigSubRow.font = { name: "Arial", size: 8.5, italic: true };
  sigSubRow.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
  sigSubRow.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

  // Signature spacing
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  const sigNameRow = worksheet.addRow([
    "",
    quote.customerName,
    "",
    "",
    "",
    "GIÁM ĐỐC KINH DOANH",
    "",
    "",
  ]);
  worksheet.mergeCells(`B${sigNameRow.number}:D${sigNameRow.number}`);
  worksheet.mergeCells(`F${sigNameRow.number}:H${sigNameRow.number}`);
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
