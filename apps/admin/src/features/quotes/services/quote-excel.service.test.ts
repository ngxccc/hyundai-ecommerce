import { describe, it, expect } from "bun:test";
import { Workbook } from "exceljs";
import { generateQuoteExcelWorkbook } from "./quote-excel.service";
import type { ComplexQuote } from "@nhatnang/database/services";

describe("quote-excel.service BDD Unit Tests", () => {
  const mockQuote: ComplexQuote = {
    id: "00000000-0000-4000-8000-000000000001",
    quoteNumber: "QT-20260902-001",
    userId: null,
    customerName: "Nguyễn Văn Test",
    customerPhone: "0901234567",
    customerEmail: "test@example.com",
    companyName: "Công ty Cổ phần Alpha",
    taxId: "0312345678",
    shippingAddress: "123 Đường Số 1, TP.HCM",
    status: "approved",
    subtotalPrice: "105000000.00",
    vatRate: 10,
    vatAmount: "10500000.00",
    totalQuotedPrice: "115500000.00",
    commercialTerms: {
      validityDays: 15,
      paymentSchedule: "Tạm ứng 30%, thanh toán 70%",
      warrantyTerms: "12 tháng chính hãng",
      deliveryTime: "3 ngày làm việc",
      deliveryLocation: "Tại kho bên mua",
    },
    expirationDate: new Date("2026-09-17T00:00:00Z"),
    note: "Giao hàng giờ hành chính",
    orderId: null,
    createdByAdminId: "admin-1",
    createdAt: new Date("2026-09-02T00:00:00Z"),
    updatedAt: new Date("2026-09-02T00:00:00Z"),
    user: null,
    messages: [],
    items: [
      {
        id: "00000000-0000-4000-8000-000000000011",
        quoteId: "00000000-0000-4000-8000-000000000001",
        productId: "00000000-0000-4000-8000-000000000101",
        isCustomItem: false,
        itemName: "Máy phát điện Hyundai DHY12500SE",
        itemModel: "DHY12500SE",
        itemSpecs: "10kVA, 1 Pha, Diesel",
        quantity: 2,
        unitPrice: "50000000.00",
        discountPercent: "5.00",
        finalUnitPrice: "47500000.00",
        totalPrice: "95000000.00",
        requestedPrice: null,
        agreedPrice: null,
        createdAt: new Date("2026-09-02T00:00:00Z"),
        updatedAt: new Date("2026-09-02T00:00:00Z"),
        product: {
          id: "00000000-0000-4000-8000-000000000101",
          nameVi: "Máy phát điện Hyundai DHY12500SE",
          nameEn: "Hyundai Generator DHY12500SE",
          slug: "hyundai-dhy12500se",
          price: "50000000.00",
          images: ["https://example.com/dhy12500se.png"],
          brandId: null,
          categoryId: null,
          totalStockCache: 5,
          totalSalesCache: 10,
          isQuoteOnly: false,
          descriptionVi: null,
          descriptionEn: null,
          shortDescriptionVi: "Máy phát điện công suất 10kVA",
          shortDescriptionEn: null,
          specs: {
            model: "DHY12500SE",
            power: 10,
            voltage: 220,
            frequency: 50,
            phase: "1phase",
            fuelType: "diesel",
            engineBrand: "Hyundai",
            alternatorBrand: "Hyundai",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
      {
        id: "00000000-0000-4000-8000-000000000012",
        quoteId: "00000000-0000-4000-8000-000000000001",
        productId: null,
        isCustomItem: true,
        itemName: "Tủ chuyển nguồn tự động ATS 100A",
        itemModel: "ATS-100A",
        itemSpecs: "100A, 3 Pha",
        quantity: 1,
        unitPrice: "10000000.00",
        discountPercent: "0.00",
        finalUnitPrice: "10000000.00",
        totalPrice: "10000000.00",
        requestedPrice: null,
        agreedPrice: null,
        createdAt: new Date("2026-09-02T00:00:00Z"),
        updatedAt: new Date("2026-09-02T00:00:00Z"),
        product: null,
      },
    ],
  };

  describe("Workbook Initialization & Sheet Layout", () => {
    it("should generate a valid non-empty Excel buffer", async () => {
      const buffer = await generateQuoteExcelWorkbook(mockQuote);
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(1000);
    });

    it("should parse back as valid Excel workbook with correct sheet name", async () => {
      const buffer = await generateQuoteExcelWorkbook(mockQuote);
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer as never);

      expect(workbook.worksheets.length).toBe(1);
      const sheet = workbook.worksheets[0]!;
      expect(sheet.name).toBe("QT-20260902-001");
    });
  });

  describe("Header, Metadata & Content Verification", () => {
    it("should include company branding, quote title, and customer information", async () => {
      const buffer = await generateQuoteExcelWorkbook(mockQuote);
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer as never);
      const sheet = workbook.worksheets[0]!;

      // Check Company Title
      expect(sheet.getCell("A1").value).toBe("HYUNDAI POWER PRODUCTS - NHẬT NĂNG");
      expect(sheet.getCell("A2").value).toBe("CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG");

      // Check Customer Info in Meta Rows
      let foundCustomer = false;
      let foundQuoteNo = false;

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (cell.value === "Nguyễn Văn Test") foundCustomer = true;
          if (cell.value === "QT-20260902-001") foundQuoteNo = true;
        });
      });

      expect(foundCustomer).toBe(true);
      expect(foundQuoteNo).toBe(true);
    });

    it("should render both catalog and custom items with correct formulas and formatting", async () => {
      const buffer = await generateQuoteExcelWorkbook(mockQuote);
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer as never);
      const sheet = workbook.worksheets[0]!;

      let catalogItemFound = false;
      let customItemFound = false;

      sheet.eachRow((row) => {
        const cellB = row.getCell(2).value;
        const valB = typeof cellB === "string" ? cellB : "";
        if (valB.includes("Máy phát điện Hyundai DHY12500SE")) {
          catalogItemFound = true;
          // Unit Price cell
          expect(row.getCell(6).value).toBe(50000000);
          // Quantity cell
          expect(row.getCell(5).value).toBe(2);
        }
        if (valB.includes("Tủ chuyển nguồn tự động ATS 100A")) {
          customItemFound = true;
          expect(row.getCell(6).value).toBe(10000000);
          expect(row.getCell(5).value).toBe(1);
        }
      });

      expect(catalogItemFound).toBe(true);
      expect(customItemFound).toBe(true);
    });

    it("should render commercial terms and amount in words", async () => {
      const buffer = await generateQuoteExcelWorkbook(mockQuote);
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer as never);
      const sheet = workbook.worksheets[0]!;

      let foundTerms = false;
      let foundWords = false;

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          const rawVal = cell.value;
          const str = typeof rawVal === "string" ? rawVal : "";
          if (str.includes("ĐIỀU KHOẢN THƯƠNG MẠI")) foundTerms = true;
          if (str.includes("Số tiền viết bằng chữ:")) foundWords = true;
        });
      });

      expect(foundTerms).toBe(true);
      expect(foundWords).toBe(true);
    });
  });
});
