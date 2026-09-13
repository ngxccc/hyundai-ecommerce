import { beforeEach, describe, expect, test } from "bun:test";
import type { DrizzleDB } from "@/database/database.module";
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { CreateAdminQuoteDto, CreateQuoteDto, QuoteQueryDto } from "./dto";
import { QuotesService } from "./quotes.service";
import { createMockDb } from "../../../test/mocks";

describe("QuotesService", () => {
  let service: QuotesService;
  const mockDb = createMockDb();

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
    createdByAdminId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockItemRecord = {
    item: {
      id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
      quoteId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      productId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9e",
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
      id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9e",
      name: "Máy phát điện",
      slug: "may-phat-dien",
      price: "100000000.00",
      images: [],
      totalStockCache: 5,
    },
  };

  beforeEach(() => {
    mockDb.clearAll();
    service = new QuotesService(mockDb as unknown as DrizzleDB);
  });

  describe("createRfq()", () => {
    describe("when customer submits valid RFQ", () => {
      test("should create quote inquiry with SUBMITTED status and null quoted totals", async () => {
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
          [
            {
              id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
              name: "Máy phát điện",
            },
          ], // 1. select products
          [{ ...mockQuoteRecord, status: "SUBMITTED" as const }], // 2. tx.insert(quotes).returning()
          [
            {
              id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
              productId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
              isCustomItem: false,
              itemName: "Máy phát điện",
              quantity: 2,
              requestedPrice: "50000000.00",
            },
          ], // 3. tx.insert(quoteItems).returning()
        ]);

        const result = await service.createRfq(
          dto,
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(mockQuoteRecord.id);
        expect(result.status).toBe("SUBMITTED");
        expect(
          (result as unknown as Record<string, unknown>)["totalQuotedPrice"],
        ).toBeUndefined();
      });
    });

    describe("when customer submits RFQ with non-existent productId", () => {
      test("should throw NotFoundException when product does not exist in database", () => {
        const dto: CreateQuoteDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          items: [
            {
              productId: "018f3a5e-7a2e-7b56-b74c-419b4eb14999",
              isCustomItem: false,
              itemName: "Thiết bị không tồn tại",
              quantity: 1,
            },
          ],
        };

        mockDb.setSelectResultsQueue([
          [], // products query returns empty
        ]);

        expect(service.createRfq(dto)).rejects.toThrow(NotFoundException);
      });
    });

    describe("when customer submits RFQ with custom item (no productId)", () => {
      test("should automatically mark isCustomItem as true without querying products table", async () => {
        const dto: CreateQuoteDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          items: [
            {
              isCustomItem: false, // auto-normalized to true
              itemName: "Tủ ATS 250A đặt riêng",
              quantity: 1,
            },
          ],
        };

        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, status: "SUBMITTED" as const }], // 1. tx.insert(quotes).returning()
          [
            {
              id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
              productId: null,
              isCustomItem: true,
              itemName: "Tủ ATS 250A đặt riêng",
              quantity: 1,
            },
          ], // 2. tx.insert(quoteItems).returning()
        ]);

        const result = await service.createRfq(dto);

        expect(result).toBeDefined();
        expect(result.items[0]?.isCustomItem).toBe(true);
        expect(result.items[0]?.productId).toBeNull();
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
          [mockQuoteRecord], // 1. tx.insert(quotes).returning
          [mockItemRecord.item], // 2. tx.insert(quoteItems).returning
        ]);

        const result = await service.createAdminQuote(
          dto,
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
        );

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
          [mockItemRecord], // allItemRecords
          [], // allMessageRecords
          [], // allUsers
        ]);

        const result = await service.findAll(query);

        expect(result.items.length).toBe(1);
        expect(result.meta.total).toBe(1);
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
      });
    });
  });

  describe("findById()", () => {
    describe("when quote exists in database", () => {
      test("should return quote with joined items and messages", async () => {
        mockDb.setSelectResultsQueue([
          [mockQuoteRecord], // quote
          [mockItemRecord], // items
          [
            {
              message: {
                id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
                quoteId: mockQuoteRecord.id,
                senderId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
                message: "Test message",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              sender: {
                id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
                fullName: "Admin",
                email: "admin@test.com",
                role: "ADMIN",
              },
            },
          ],
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
      test("should throw UnprocessableEntityException", () => {
        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, status: "APPROVED" }], // terminal APPROVED status
          [],
          [],
          [],
        ]);

        // APPROVED cannot transition to DRAFT
        expect(
          service.updateStatus(mockQuoteRecord.id, "DRAFT"),
        ).rejects.toThrow(UnprocessableEntityException);
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
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
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
          service.updateItemPrice(
            mockQuoteRecord.id,
            "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
            "95000000.00",
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("sendMessage()", () => {
    describe("when sending message on a SUBMITTED quote", () => {
      test("should record message and advance status to NEGOTIATING", async () => {
        const mockMessage = {
          id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9d",
          quoteId: mockQuoteRecord.id,
          senderId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
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
              id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
              fullName: "Nguyễn Văn A",
              email: "a@gmail.com",
              role: "SALES",
            },
          ], // select sender
        ]);

        const result = await service.sendMessage(
          mockQuoteRecord.id,
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
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
          id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9f",
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
          "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
        );

        expect(result).toBeDefined();
        expect(result.status).toBe("APPROVED");
        expect(result.orderId).toBe("018f3a5e-7a2e-7b56-b74c-419b4eb14b9f");
      });
    });

    describe("when quote has no registered user ID", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResultsQueue([
          [{ ...mockQuoteRecord, userId: null }], // quote without user
        ]);
        expect(
          service.approveAndConvertToOrder(
            mockQuoteRecord.id,
            "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
