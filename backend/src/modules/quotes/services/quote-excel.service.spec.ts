import { beforeEach, describe, expect, test } from "bun:test";
import { Workbook } from "exceljs";
import { QuoteExcelService } from "./quote-excel.service";
import type { QuoteResponseDto } from "../dto/quote-response.dto";

describe("QuoteExcelService", () => {
  let service: QuoteExcelService;

  const mockQuote: QuoteResponseDto = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    quoteNumber: "QT-20260904-5892",
    userId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@example.com",
    companyName: "Công ty Cổ Phần Xây Dựng ABC",
    taxId: "0312345678",
    shippingAddress: "Chân công trình KCN Tân Bình",
    status: "APPROVED",
    subtotalPrice: "245000000.00",
    vatRate: 10,
    vatAmount: "24500000.00",
    totalQuotedPrice: "269500000.00",
    commercialTerms: {
      validityDays: 15,
      paymentSchedule: "Tạm ứng 30%, 70% sau khi giao hàng",
      warrantyTerms: "12 tháng hoặc 1.000 giờ",
      deliveryTime: "01 - 03 ngày",
      deliveryLocation: "Chân công trình",
    },
    expirationDate: new Date("2026-09-19T00:00:00.000Z"),
    note: "Hỗ trợ lắp đặt miễn phí",
    orderId: null,
    createdByAdminId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
    items: [
      {
        id: "item-1",
        quoteId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        productId: "prod-1",
        isCustomItem: false,
        itemName: "Máy phát điện Hyundai DHY65KSE",
        itemModel: "DHY65KSE",
        itemSpecs: "Công suất 60kVA, 3 pha 230/400V",
        quantity: 1,
        unitPrice: "245000000.00",
        discountPercent: "0.00",
        finalUnitPrice: "245000000.00",
        totalPrice: "245000000.00",
        requestedPrice: "245000000.00",
        agreedPrice: "245000000.00",
        product: {
          id: "prod-1",
          nameVi: "Máy phát điện Hyundai DHY65KSE",
          nameEn: null,
          slug: "may-phat-dien-hyundai-dhy65kse",
          price: "245000000.00",
          images: [],
          totalStockCache: 5,
        },
        createdAt: new Date("2026-09-04T08:00:00.000Z"),
        updatedAt: new Date("2026-09-04T08:00:00.000Z"),
      },
    ],
  };

  beforeEach(() => {
    service = new QuoteExcelService();
  });

  describe("generateQuoteExcelWorkbook()", () => {
    describe("when provided with a valid B2B quote", () => {
      test("should generate a valid Excel spreadsheet buffer with worksheets and metadata", async () => {
        const buffer = await service.generateQuoteExcelWorkbook(mockQuote);

        expect(buffer).toBeDefined();
        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(buffer.length).toBeGreaterThan(0);

        // Parse back with ExcelJS to assert structural integrity
        const workbook = new Workbook();
        await workbook.xlsx.load(
          buffer as unknown as Parameters<typeof workbook.xlsx.load>[0],
        );

        expect(workbook.worksheets.length).toBe(1);
        const worksheet = workbook.getWorksheet(1);
        expect(worksheet).toBeDefined();

        // Verify corporate title banner
        const titleCell = worksheet?.getCell(1, 1);
        expect(titleCell?.value).toBe("HYUNDAI POWER PRODUCTS - NHẬT NĂNG");

        // Verify quote number exists in worksheet
        let quoteNumberFound = false;
        worksheet?.eachRow((row) => {
          row.eachCell((cell) => {
            if (cell.value === mockQuote.quoteNumber) {
              quoteNumberFound = true;
            }
          });
        });
        expect(quoteNumberFound).toBe(true);
      });
    });
  });
});
