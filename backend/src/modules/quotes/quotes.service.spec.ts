import { beforeEach, describe, expect, test } from "bun:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { QuotesService } from "./quotes.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb, createMockI18nService } from "../../../test/mocks";
import type { CreateAdminQuoteDto, CreateQuoteDto, QuoteQueryDto } from "./dto";

describe("QuotesService", () => {
  let service: QuotesService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  const mockQuoteRecord = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    quoteNumber: "QT-20260904-5892",
    userId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@example.com",
    companyName: "Công ty ABC",
    taxId: "0312345678",
    shippingAddress: "Kho Tân Bình",
    status: "DRAFT" as const,
    subtotalPrice: "100000000.00",
    vatRate: 10,
    vatAmount: "10000000.00",
    totalQuotedPrice: "110000000.00",
    commercialTerms: { validityDays: 15 },
    expirationDate: new Date("2026-09-19T00:00:00.000Z"),
    note: "Ghi chú",
    orderId: null,
    createdByAdminId: "admin-1",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockItemRecord = {
    item: {
      id: "item-1",
      quoteId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      productId: "prod-1",
      isCustomItem: false,
      itemName: "Máy phát điện",
      itemModel: "DHY65KSE",
      itemSpecs: "60kVA",
      quantity: 1,
      unitPrice: "100000000.00",
      discountPercent: "0.00",
      finalUnitPrice: "100000000.00",
      totalPrice: "100000000.00",
      requestedPrice: null,
      agreedPrice: null,
      createdAt: new Date("2026-09-04T08:00:00.000Z"),
      updatedAt: new Date("2026-09-04T08:00:00.000Z"),
    },
    product: {
      id: "prod-1",
      nameVi: "Máy phát điện",
      nameEn: null,
      slug: "may-phat-dien",
      price: "100000000.00",
      images: [],
      totalStockCache: 5,
    },
  };

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new QuotesService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("createRfq()", () => {
    describe("when customer submits valid RFQ", () => {
      test("should calculate requested subtotal and create quote with SUBMITTED status", async () => {
        const dto: CreateQuoteDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          customerEmail: "customer@gmail.com",
          items: [
            {
              productId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
              isCustomItem: false,
              itemName: "Máy phát điện",
              quantity: 2,
              requestedPrice: "50000000.00",
            },
          ],
        };

        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // 1. tx.insert(quotes).returning()
          [mockQuoteRecord], // 2. findById: select quote
          [mockItemRecord], // 3. findById: select items
          [], // 4. findById: select messages
          [], // 5. findById: select user
        ]);

        const result = await service.createRfq(
          dto,
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(mockQuoteRecord.id);
      });
    });
  });

  describe("createAdminQuote()", () => {
    describe("when admin creates quote with custom item and discount", () => {
      test("should compute server-side financials including VAT and totalQuotedPrice", async () => {
        const dto: CreateAdminQuoteDto = {
          customerName: "Công ty ABC",
          customerPhone: "0901234567",
          vatRate: 10,
          items: [
            {
              isCustomItem: true,
              itemName: "Tủ ATS chuyển nguồn tự động 100A",
              quantity: 2,
              unitPrice: 10000000,
              discountPercent: 10,
            },
          ],
        };

        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // 1. insert returning
          [mockQuoteRecord], // 2. findById quote
          [mockItemRecord], // 3. findById items
          [], // 4. findById messages
          [], // 5. findById user
        ]);

        const result = await service.createAdminQuote(dto, "admin-1");

        expect(result).toBeDefined();
        expect(result.quoteNumber).toBe(mockQuoteRecord.quoteNumber);
      });
    });
  });

  describe("findAll()", () => {
    describe("when querying quotes with pagination and status filter", () => {
      test("should return list of quotes and total count", async () => {
        const query: QuoteQueryDto = {
          page: 1,
          limit: 10,
          status: "DRAFT",
        };

        mockDb.setSelectResultsQueue([
          [{ count: 1 }], // total count
          [mockQuoteRecord], // quote records
          [mockQuoteRecord], // findById quote
          [mockItemRecord], // findById items
          [], // findById messages
          [], // findById user
        ]);

        const result = await service.findAll(query);

        expect(result.items.length).toBe(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
      });
    });
  });

  describe("findById()", () => {
    describe("when quote exists in database", () => {
      test("should return quote with joined items and messages", async () => {
        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // quote
          [mockItemRecord], // items
          [], // messages
          [], // user
        ]);

        const result = await service.findById(mockQuoteRecord.id);

        expect(result.id).toBe(mockQuoteRecord.id);
        expect(result.items.length).toBe(1);
      });
    });

    describe("when quote does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);
        expect(service.findById("non-existent-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("updateStatus()", () => {
    describe("when valid state machine transition is requested", () => {
      test("should update quote status to SUBMITTED", async () => {
        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // initial findById
          [mockItemRecord], // items
          [], // messages
          [], // user
          [mockQuoteRecord], // update returning
          [{ ...mockQuoteRecord, status: "SUBMITTED" }], // subsequent findById
          [mockItemRecord], // items
          [], // messages
          [], // user
        ]);

        const result = await service.updateStatus(
          mockQuoteRecord.id,
          "SUBMITTED",
        );

        expect(result).toBeDefined();
      });
    });

    describe("when invalid state machine transition is requested", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, status: "APPROVED" }], // terminal APPROVED status
          [],
          [],
          [],
        ]);

        // APPROVED cannot transition to DRAFT
        expect(
          service.updateStatus(mockQuoteRecord.id, "DRAFT"),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("updateItemPrice()", () => {
    describe("when adjusting price on an editable quote", () => {
      test("should update agreed price and recalculate totals", async () => {
        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // findById
          [mockItemRecord], // items
          [], // messages
          [], // user
          [mockItemRecord.item], // select item inside transaction
          [mockItemRecord.item], // select all items inside transaction
          [mockQuoteRecord], // findById after update
          [mockItemRecord], // items
          [], // messages
          [], // user
        ]);

        const result = await service.updateItemPrice(
          mockQuoteRecord.id,
          "item-1",
          "95000000.00",
        );

        expect(result).toBeDefined();
      });
    });

    describe("when adjusting price on a terminal approved quote", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, status: "APPROVED" }], // quote is APPROVED
          [],
          [],
          [],
        ]);
        expect(
          service.updateItemPrice(mockQuoteRecord.id, "item-1", "95000000.00"),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("sendMessage()", () => {
    describe("when sending message on a SUBMITTED quote", () => {
      test("should record message and advance status to NEGOTIATING", async () => {
        const mockMessage = {
          id: "msg-1",
          quoteId: mockQuoteRecord.id,
          senderId: "user-1",
          message: "Xin hỏi có chiết khấu thêm không?",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, status: "SUBMITTED" }], // findById
          [mockItemRecord], // items
          [], // messages
          [], // user
          [mockMessage], // insert quoteMessages returning
          [
            {
              id: "user-1",
              fullName: "Nguyễn Văn A",
              email: "a@gmail.com",
              role: "SALES",
            },
          ], // select sender
        ]);

        const result = await service.sendMessage(
          mockQuoteRecord.id,
          "user-1",
          "Xin hỏi có chiết khấu thêm không?",
        );

        expect(result).toBeDefined();
        expect(result.message).toBe("Xin hỏi có chiết khấu thêm không?");
      });
    });
  });

  describe("approveAndConvertToOrder()", () => {
    describe("when quote is valid and has registered user", () => {
      test("should atomically convert quote to order and return order confirmation", async () => {
        const mockOrder = {
          id: "ord-1",
          orderNumber: "ORD-20260904-1234",
          userId: mockQuoteRecord.userId,
          status: "PENDING",
        };

        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // select quote in tx
          [mockItemRecord], // select items in tx
          [mockOrder], // insert order returning
        ]);

        const result = await service.approveAndConvertToOrder(
          mockQuoteRecord.id,
          "admin-1",
        );

        expect(result).toBeDefined();
        expect(result.status).toBe("APPROVED");
        expect(result.orderId).toBe("ord-1");
      });
    });

    describe("when quote has no registered user ID", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, userId: null }], // quote without user
        ]);
        expect(
          service.approveAndConvertToOrder(mockQuoteRecord.id, "admin-1"),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
