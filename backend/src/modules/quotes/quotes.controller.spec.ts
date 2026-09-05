import { beforeEach, describe, expect, test, mock } from "bun:test";
import type { Response } from "express";
import { QuotesController } from "./quotes.controller";
import type { QuotesService } from "./quotes.service";
import type {
  CreateAdminQuoteDto,
  CreateQuoteDto,
  QuoteQueryDto,
  QuoteResponseDto,
  SendQuoteMessageDto,
  UpdateQuoteItemPriceDto,
  UpdateQuoteStatusDto,
} from "./dto";

describe("QuotesController", () => {
  let controller: QuotesController;

  const mockQuote: QuoteResponseDto = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    quoteNumber: "QT-20260904-5892",
    userId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@example.com",
    companyName: "Công ty ABC",
    taxId: "0312345678",
    shippingAddress: "Kho Tân Bình",
    status: "DRAFT",
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
    items: [],
    messages: [],
    user: null,
  };

  const mockQuotesService = {
    createRfq: mock((_dto: CreateQuoteDto) => Promise.resolve(mockQuote)),
    createAdminQuote: mock((_dto: CreateAdminQuoteDto, _adminId: string) =>
      Promise.resolve(mockQuote),
    ),
    findAll: mock((_query: QuoteQueryDto) =>
      Promise.resolve({
        items: [mockQuote],
        total: 1,
        page: 1,
        limit: 20,
      }),
    ),
    findById: mock((_id: string) => Promise.resolve(mockQuote)),
    updateStatus: mock((_id: string, _status: string) =>
      Promise.resolve(
        Object.assign({}, mockQuote, { status: "SUBMITTED" as const }),
      ),
    ),
    updateItemPrice: mock(
      (_quoteId: string, _itemId: string, _agreedPrice: string) =>
        Promise.resolve(mockQuote),
    ),
    sendMessage: mock((_quoteId: string, _senderId: string, _message: string) =>
      Promise.resolve({
        id: "msg-1",
        quoteId: mockQuote.id,
        senderId: "user-1",
        message: "Tin nhắn",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    approveAndConvertToOrder: mock((_quoteId: string, _adminId: string) =>
      Promise.resolve({
        orderId: "ord-1",
        quoteId: mockQuote.id,
        status: "APPROVED" as const,
      }),
    ),
    clearAll() {
      this.createRfq.mockClear();
      this.createAdminQuote.mockClear();
      this.findAll.mockClear();
      this.findById.mockClear();
      this.updateStatus.mockClear();
      this.updateItemPrice.mockClear();
      this.sendMessage.mockClear();
      this.approveAndConvertToOrder.mockClear();
    },
  };

  const mockExcelService = {
    generateQuoteExcelWorkbook: mock((_quote: QuoteResponseDto) =>
      Promise.resolve(Buffer.from("excel-binary-data")),
    ),
  };

  beforeEach(() => {
    mockQuotesService.clearAll();
    controller = new QuotesController(
      mockQuotesService as unknown as QuotesService,
      mockExcelService,
    );
  });

  describe("POST /quotes", () => {
    describe("when customer submits RFQ", () => {
      test("should return wrapped created quote", async () => {
        const dto: CreateQuoteDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          items: [
            {
              productId: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
              isCustomItem: false,
              itemName: "Máy phát điện",
              quantity: 1,
            },
          ],
        };

        const result = await controller.submitRfq(dto);

        expect(mockQuotesService.createRfq).toHaveBeenCalledWith(dto);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("018f3a5e-7a2e-7b56-b74c-419b4eb14b9a");
      });
    });
  });

  describe("POST /quotes/admin", () => {
    describe("when admin creates B2B quote", () => {
      test("should return wrapped created quote", async () => {
        const dto: CreateAdminQuoteDto = {
          customerName: "Công ty ABC",
          customerPhone: "0901234567",
          vatRate: 10,
          items: [
            {
              isCustomItem: true,
              itemName: "Thiết bị",
              quantity: 1,
              unitPrice: 10000000,
              discountPercent: 0,
            },
          ],
        };

        const result = await controller.createAdminQuote(dto, "admin-1");

        expect(mockQuotesService.createAdminQuote).toHaveBeenCalledWith(
          dto,
          "admin-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.quoteNumber).toBe("QT-20260904-5892");
      });
    });
  });

  describe("GET /quotes", () => {
    describe("when querying quotes list", () => {
      test("should return wrapped paginated list", async () => {
        const query: QuoteQueryDto = { page: 1, limit: 20 };

        const result = await controller.listQuotes(query);

        expect(mockQuotesService.findAll).toHaveBeenCalledWith(query);
        expect(result.success).toBe(true);
        expect(result.data.items.length).toBe(1);
        expect(result.data.total).toBe(1);
      });
    });
  });

  describe("GET /quotes/:id", () => {
    describe("when retrieving quote details", () => {
      test("should return wrapped quote", async () => {
        const result = await controller.getQuoteById(mockQuote.id);

        expect(mockQuotesService.findById).toHaveBeenCalledWith(mockQuote.id);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe(mockQuote.id);
      });
    });
  });

  describe("PATCH /quotes/:id/status", () => {
    describe("when updating quote status", () => {
      test("should return wrapped updated quote", async () => {
        const dto: UpdateQuoteStatusDto = { status: "SUBMITTED" };

        const result = await controller.updateStatus(mockQuote.id, dto);

        expect(mockQuotesService.updateStatus).toHaveBeenCalledWith(
          mockQuote.id,
          "SUBMITTED",
        );
        expect(result.success).toBe(true);
        expect(result.data.status).toBe("SUBMITTED");
      });
    });
  });

  describe("PUT /quotes/:id/items/:itemId/price", () => {
    describe("when adjusting line item price", () => {
      test("should return wrapped updated quote", async () => {
        const dto: UpdateQuoteItemPriceDto = { agreedPrice: "95000000.00" };

        const result = await controller.updateItemPrice(
          mockQuote.id,
          "item-1",
          dto,
        );

        expect(mockQuotesService.updateItemPrice).toHaveBeenCalledWith(
          mockQuote.id,
          "item-1",
          "95000000.00",
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe("POST /quotes/:id/messages", () => {
    describe("when posting negotiation timeline message", () => {
      test("should return wrapped created message", async () => {
        const dto: SendQuoteMessageDto = { message: "Tin nhắn thảo luận" };

        const result = await controller.sendMessage(
          mockQuote.id,
          "user-1",
          dto,
        );

        expect(mockQuotesService.sendMessage).toHaveBeenCalledWith(
          mockQuote.id,
          "user-1",
          "Tin nhắn thảo luận",
        );
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("msg-1");
      });
    });
  });

  describe("POST /quotes/:id/approve-to-order", () => {
    describe("when admin approves quote to order", () => {
      test("should return wrapped conversion confirmation", async () => {
        const result = await controller.approveToOrder(mockQuote.id, "admin-1");

        expect(mockQuotesService.approveAndConvertToOrder).toHaveBeenCalledWith(
          mockQuote.id,
          "admin-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.status).toBe("APPROVED");
        expect(result.data.orderId).toBe("ord-1");
      });
    });
  });

  describe("GET /quotes/:id/export-excel", () => {
    describe("when requesting Excel export", () => {
      test("should set response headers and return StreamableFile", async () => {
        const mockResponse = {
          set: mock((_headers: Record<string, string>) => mockResponse),
        };

        const result = await controller.exportExcel(
          mockQuote.id,
          mockResponse as unknown as Response,
        );

        expect(mockQuotesService.findById).toHaveBeenCalledWith(mockQuote.id);
        expect(
          mockExcelService.generateQuoteExcelWorkbook,
        ).toHaveBeenCalledWith(mockQuote);
        expect(mockResponse.set).toHaveBeenCalled();
        expect(result).toBeDefined();
      });
    });
  });
});
