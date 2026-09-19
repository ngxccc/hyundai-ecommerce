import { beforeEach, describe, expect, test } from "bun:test";
import { Workbook } from "exceljs";
import { QuoteExcelService } from "./quote-excel.service";
import type { CompanySettingsService } from "@/modules/company-settings/company-settings.service";
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
    orderNumber: null,
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
          name: "Máy phát điện Hyundai DHY65KSE",
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
    const mockCompanyService = {
      getSettings: () =>
        Promise.resolve({
          id: "019de1a0-0000-7000-8000-000000000099",
          legalNameVi: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
          legalNameEn: "NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD",
          shortName: "Hyundai Nhật Năng",
          brandName: "Hyundai",
          brandTitle: "HYUNDAI POWER PRODUCTS",
          brandFullName: "Hyundai Power Products Vietnam",
          taxId: "0316447814",
          hotlines: {
            project: {
              raw: "0901497771",
              display: "0901 49 7771",
              formatted: "0901.49.7771",
            },
            technical: {
              raw: "0982890698",
              display: "0982 89 0698",
              formatted: "0982.89.0698",
            },
          },
          emails: {
            sales: "sales@hyundainhatnang.vn",
            project: "duan@hyundainhatnang.com",
            support: "hyundaipowerproducts.vn@gmail.com",
            general: "contact@hyundainhatnang.vn",
          },
          addresses: {
            headquarters: {
              vi: "310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. Hồ Chí Minh",
              en: "310/61 Chien Luoc Street, Binh Tri Dong A Ward, Binh Tan District, HCMC",
            },
            warehouse: {
              vi: "Tổng kho KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương",
              en: "Song Than 2 IP Warehouse",
            },
          },
          workingHours: {
            vi: "Thứ 2 - Thứ 7: 08:00 - 17:30",
            en: "Mon - Sat: 08:00 - 17:30",
          },
          links: {
            website: "https://hyundainhatnang.vn",
          },
          bank: {
            bankName: "VietinBank",
            branchVi: "Chi nhánh Tây Sài Gòn",
            branchEn: "Tay Sai Gon Branch",
            accountNo: "113002859999",
            accountName: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
            bin: "vietinbank",
            qrTemplate: "qr_only",
          },
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        }),
    } as unknown as CompanySettingsService;
    service = new QuoteExcelService(mockCompanyService);
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

        // Verify quote number and dynamic company metadata exist in worksheet
        let quoteNumberFound = false;
        let legalNameFound = false;
        let taxIdFound = false;
        let hotlineFound = false;
        worksheet?.eachRow((row) => {
          row.eachCell((cell) => {
            const strVal =
              typeof cell.value === "string"
                ? cell.value
                : typeof cell.value === "number"
                  ? String(cell.value)
                  : "";
            if (cell.value === mockQuote.quoteNumber) {
              quoteNumberFound = true;
            }
            if (strVal.includes("CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG")) {
              legalNameFound = true;
            }
            if (strVal.includes("0316447814")) {
              taxIdFound = true;
            }
            if (
              strVal.includes("0901.49.7771") ||
              strVal.includes("0901 49 7771")
            ) {
              hotlineFound = true;
            }
          });
        });
        expect(quoteNumberFound).toBe(true);
        expect(legalNameFound).toBe(true);
        expect(taxIdFound).toBe(true);
        expect(hotlineFound).toBe(true);
      });
    });
  });
});
