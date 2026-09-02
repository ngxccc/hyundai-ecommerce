import { QUOTE_CONSTANTS } from "@nhatnang/shared/constants";
import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockFindFirst,
  mockFindMany,
} from "../../tests/utils/db-mock";
import {
  DbQuotesService,
  type ComplexQuote,
  type QuoteListItem,
} from "./quotes.service";
import {
  type TQuote,
  type TQuoteItem,
  type TQuoteMessage,
  type TUser,
  type TProduct,
} from "../../schemas";
import type { IDatabase } from "../../client";

const quotesService = new DbQuotesService(mockDb as unknown as IDatabase);

// Mock entities representing stable database instances
const mockUser: TUser = {
  id: "user-1",
  name: "Dealer Test",
  email: "dealer@test.com",
  emailVerified: true,
  image: null,
  role: "DEALER_APPROVER",
  dealerTierId: null,
  parentId: null,
  phone: "0901234567",
  companyName: "Hyundai Corp",
  taxId: null,
  businessType: "DEALER",
  province: "HCM",
  creditLimit: "0.00",
  currentDebt: "0.00",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockProduct: TProduct = {
  id: "prod-1",
  nameVi: "Generator 100kW",
  nameEn: null,
  slug: "generator-100kw",
  price: "1000.00",
  descriptionVi: null,
  descriptionEn: null,
  shortDescriptionVi: null,
  shortDescriptionEn: null,
  images: [],
  brandId: null,
  categoryId: null,
  specs: {},
  totalStockCache: 5,
  totalSalesCache: 0,
  isQuoteOnly: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("QuotesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createQuote()", () => {
    describe("when inserting quote with line items", () => {
      test("should insert quote and items inside a transaction", async () => {
        const mockQuote: TQuote = {
          id: "quote-1",
          quoteNumber: "QT-20260902-001",
          userId: "user-1",
          customerName: "Dealer Test",
          customerPhone: "0901234567",
          customerEmail: "dealer@test.com",
          companyName: "Hyundai Corp",
          taxId: null,
          shippingAddress: null,
          status: "pending_review",
          subtotalPrice: "200.00",
          vatRate: 10,
          vatAmount: "20.00",
          totalQuotedPrice: "220.00",
          commercialTerms: null,
          expirationDate: null,
          note: "Initial requested quote",
          orderId: null,
          createdByAdminId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReturning.mockResolvedValueOnce([mockQuote]);

        const result = await quotesService.createQuote(
          {
            userId: "user-1",
            status: "pending_review",
            note: "Initial requested quote",
          },
          [{ productId: "prod-1", quantity: 2, requestedPrice: "100.00" }],
        );

        expect(mockInsert).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockQuote);
      });
    });
  });

  describe("createAdminQuote()", () => {
    describe("when calculating financial totals for catalog and custom items", () => {
      test("should calculate financial totals (subtotal, VAT, total) and insert quote + items inside a transaction", async () => {
        const mockAdminQuote: TQuote = {
          id: "quote-admin-1",
          quoteNumber: "QT-20260902-001",
          userId: "user-1",
          customerName: "Nguyen Van A",
          customerPhone: "0987654321",
          customerEmail: "anguyen@example.com",
          companyName: "Alpha Construction JSC",
          taxId: "0101234567",
          shippingAddress: "123 Hanoi Street",
          status: "approved",
          subtotalPrice: "72650000.00",
          vatRate: 10,
          vatAmount: "7265000.00",
          totalQuotedPrice: "79915000.00",
          commercialTerms: {
            validityDays: 15,
            paymentSchedule: "30% deposit, 70% before shipping",
            warrantyTerms: "12 months or 1000 running hours",
            deliveryTime: "3-5 business days",
            deliveryLocation: "Hanoi",
          },
          expirationDate: new Date("2026-09-17T00:00:00.000Z"),
          note: "Urgent project requirement",
          orderId: null,
          createdByAdminId: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockReturning.mockResolvedValueOnce([mockAdminQuote]);

        const result = await quotesService.createAdminQuote({
          userId: "user-1",
          customerName: "Nguyen Van A",
          customerPhone: "0987654321",
          customerEmail: "anguyen@example.com",
          companyName: "Alpha Construction JSC",
          taxId: "0101234567",
          shippingAddress: "123 Hanoi Street",
          vatRate: 10,
          commercialTerms: {
            validityDays: 15,
            paymentSchedule: "30% deposit, 70% before shipping",
            warrantyTerms: "12 months or 1000 running hours",
            deliveryTime: "3-5 business days",
            deliveryLocation: "Hanoi",
          },
          note: "Urgent project requirement",
          createdByAdminId: "admin-1",
          items: [
            {
              productId: "prod-1",
              isCustomItem: false,
              itemName: "Hyundai DHY12500SE Generator",
              itemModel: "DHY12500SE",
              itemSpecs: "10kVA, Diesel, 1-Phase",
              quantity: 1,
              unitPrice: 70000000,
              discountPercent: 5,
            },
            {
              isCustomItem: true,
              itemName: "Hyundai ATS Panel 100A",
              itemModel: "ATS-100A",
              itemSpecs: "Auto Transfer Switch",
              quantity: 1,
              unitPrice: 6150000,
              discountPercent: 0,
            },
          ],
        });

        expect(mockInsert).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockAdminQuote);
      });
    });

    describe("when creating a quote for walk-in or guest customers", () => {
      test("should support walk-in/guest customers without registered userId", async () => {
        const mockGuestQuote: TQuote = {
          id: "quote-guest-1",
          quoteNumber: "QT-20260902-002",
          userId: null,
          customerName: "Tran Thi B",
          customerPhone: "0912345678",
          customerEmail: null,
          companyName: null,
          taxId: null,
          shippingAddress: "Da Nang",
          status: "approved",
          subtotalPrice: "50000000.00",
          vatRate: 10,
          vatAmount: "5000000.00",
          totalQuotedPrice: "55000000.00",
          commercialTerms: null,
          expirationDate: null,
          note: null,
          orderId: null,
          createdByAdminId: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockReturning.mockResolvedValueOnce([mockGuestQuote]);

        const result = await quotesService.createAdminQuote({
          customerName: "Tran Thi B",
          customerPhone: "0912345678",
          shippingAddress: "Da Nang",
          createdByAdminId: "admin-1",
          items: [
            {
              isCustomItem: true,
              itemName: "Portable Generator 5kW",
              quantity: 1,
              unitPrice: 50000000,
              discountPercent: 0,
            },
          ],
        });

        expect(mockInsert).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockGuestQuote);
      });
    });

    describe("when input items array is empty", () => {
      test("should throw an error when items array is empty", () => {
        expect(
          quotesService.createAdminQuote({
            customerName: "Test Customer",
            customerPhone: "0900000000",
            items: [],
          }),
        ).rejects.toThrow("errors.emptyQuoteItems");
      });
    });
  });

  describe("getComplexQuote()", () => {
    describe("when fetching quote with relations", () => {
      test("should return nested quote details when quoteId is a valid UUID", async () => {
        const validQuoteId = "019dee3c-0163-777a-825a-4732f2ecce99";
        const mockQuoteDetails: ComplexQuote = {
          id: validQuoteId,
          quoteNumber: "QT-20260902-001",
          userId: "user-1",
          customerName: "Dealer Test",
          customerPhone: "0901234567",
          customerEmail: "dealer@test.com",
          companyName: "Hyundai Corp",
          taxId: null,
          shippingAddress: null,
          status: "pending_review",
          subtotalPrice: "1800.00",
          vatRate: 10,
          vatAmount: "180.00",
          totalQuotedPrice: "1980.00",
          commercialTerms: null,
          expirationDate: null,
          note: "Initial requested quote",
          orderId: null,
          createdByAdminId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: mockUser,
          items: [
            {
              id: "item-1",
              quoteId: validQuoteId,
              productId: "prod-1",
              isCustomItem: false,
              itemName: "Generator 100kW",
              itemModel: "GEN-100KW",
              itemSpecs: "100kW Diesel Generator",
              quantity: 2,
              unitPrice: "900.00",
              discountPercent: "0.00",
              finalUnitPrice: "900.00",
              totalPrice: "1800.00",
              requestedPrice: "900.00",
              agreedPrice: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              product: mockProduct,
            },
          ],
          messages: [
            {
              id: "msg-1",
              quoteId: validQuoteId,
              senderId: "user-1",
              message: "Initial offer",
              createdAt: new Date(),
              updatedAt: new Date(),
              sender: mockUser,
            },
          ],
        };
        mockFindFirst.mockResolvedValueOnce(mockQuoteDetails);

        const result = await quotesService.getComplexQuote(validQuoteId);

        expect(mockFindFirst).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockQuoteDetails);
      });
    });

    describe("when quote id is invalid or non-UUID format", () => {
      test("should return undefined without querying the database", async () => {
        const result = await quotesService.getComplexQuote("new");
        expect(mockFindFirst).toHaveBeenCalledTimes(0);
        expect(result).toBeUndefined();
      });
    });
  });

  describe("listQuotes()", () => {
    describe("when filtering quotes by user id", () => {
      test("should return a list of quotes", async () => {
        const mockQuotesDetails: QuoteListItem[] = [
          {
            id: "quote-1",
            quoteNumber: "QT-20260902-001",
            userId: "user-1",
            customerName: "Dealer Test",
            customerPhone: "0901234567",
            customerEmail: "dealer@test.com",
            companyName: "Hyundai Corp",
            taxId: null,
            shippingAddress: null,
            status: "pending_review",
            subtotalPrice: "1800.00",
            vatRate: 10,
            vatAmount: "180.00",
            totalQuotedPrice: "1980.00",
            commercialTerms: null,
            expirationDate: null,
            note: null,
            orderId: null,
            createdByAdminId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: mockUser,
            items: [
              {
                id: "item-1",
                quoteId: "quote-1",
                productId: "prod-1",
                isCustomItem: false,
                itemName: "Generator 100kW",
                itemModel: "GEN-100KW",
                itemSpecs: "100kW Diesel Generator",
                quantity: 2,
                unitPrice: "900.00",
                discountPercent: "0.00",
                finalUnitPrice: "900.00",
                totalPrice: "1800.00",
                requestedPrice: "900.00",
                agreedPrice: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                product: mockProduct,
              },
            ],
          },
        ];
        mockFindMany.mockResolvedValueOnce(mockQuotesDetails);

        const result = await quotesService.listQuotes({ userId: "user-1" });

        expect(mockFindMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockQuotesDetails);
      });
    });
  });

  describe("updateQuoteStatus()", () => {
    describe("when updating quote status", () => {
      test("should update and return the quote", async () => {
        const mockQuote: TQuote = {
          id: "quote-1",
          quoteNumber: "QT-20260902-001",
          userId: "user-1",
          customerName: "Dealer Test",
          customerPhone: "0901234567",
          customerEmail: "dealer@test.com",
          companyName: "Hyundai Corp",
          taxId: null,
          shippingAddress: null,
          status: "negotiating",
          subtotalPrice: "1800.00",
          vatRate: 10,
          vatAmount: "180.00",
          totalQuotedPrice: "1980.00",
          commercialTerms: null,
          expirationDate: null,
          note: null,
          orderId: null,
          createdByAdminId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReturning.mockResolvedValueOnce([mockQuote]);

        const result = await quotesService.updateQuoteStatus(
          "quote-1",
          "negotiating",
        );

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockQuote);
      });
    });
  });

  describe("addQuoteMessage()", () => {
    describe("when adding timeline message", () => {
      test("should insert and return a timeline message", async () => {
        const mockMsg: TQuoteMessage = {
          id: "msg-1",
          quoteId: "quote-1",
          senderId: "user-1",
          message: "Counter offer details",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReturning.mockResolvedValueOnce([mockMsg]);

        const result = await quotesService.addQuoteMessage({
          quoteId: "quote-1",
          senderId: "user-1",
          message: "Counter offer details",
        });

        expect(mockInsert).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockMsg);
      });
    });
  });

  describe("updateQuoteItemPrice()", () => {
    describe("when updating agreed item price", () => {
      test("should update agreed price of the item", async () => {
        const mockItem: TQuoteItem = {
          id: "item-1",
          quoteId: "quote-1",
          productId: "prod-1",
          isCustomItem: false,
          itemName: "Generator 100kW",
          itemModel: "GEN-100KW",
          itemSpecs: "100kW Diesel Generator",
          quantity: 2,
          unitPrice: "900.00",
          discountPercent: "0.00",
          finalUnitPrice: "850.00",
          totalPrice: "1700.00",
          requestedPrice: "900.00",
          agreedPrice: "850.00",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReturning.mockResolvedValueOnce([mockItem]);

        const result = await quotesService.updateQuoteItemPrice(
          "item-1",
          "95.00",
        );

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockItem);
      });
    });
  });

  describe("approveAndConvertToOrder()", () => {
    describe("when converting negotiated quote into confirmed order", () => {
      test("should process quote-to-order transition atomically inside transaction", async () => {
        const mockQuoteDetails = {
          id: "quote-1",
          userId: "user-1",
          status: "negotiating" as const,
          totalQuotedPrice: null,
          expirationDate: null,
          note: "Test quote conversion",
          orderId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "item-1",
              quoteId: "quote-1",
              productId: "prod-1",
              isCustomItem: false,
              itemName: "Generator 100kW",
              itemModel: "GEN-100KW",
              itemSpecs: "100kW Diesel Generator",
              quantity: 2,
              unitPrice: "900.00",
              discountPercent: "0.00",
              finalUnitPrice: "850.00",
              totalPrice: "1700.00",
              requestedPrice: "900.00",
              agreedPrice: "850.00",
              createdAt: new Date(),
              updatedAt: new Date(),
              product: mockProduct,
            },
            {
              id: "item-2",
              quoteId: "quote-1",
              productId: "prod-2",
              isCustomItem: false,
              itemName: "Generator 50kW",
              itemModel: "GEN-50KW",
              itemSpecs: "50kW Diesel Generator",
              quantity: 1,
              unitPrice: "100.00",
              discountPercent: "0.00",
              finalUnitPrice: "100.00",
              totalPrice: "100.00",
              requestedPrice: "100.00",
              agreedPrice: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              product: {
                id: "prod-2",
                nameVi: "Generator 50kW",
                nameEn: null,
                slug: "generator-50kw",
                price: "100.00",
                descriptionVi: null,
                descriptionEn: null,
                shortDescriptionVi: null,
                shortDescriptionEn: null,
                images: [],
                brandId: null,
                categoryId: null,
                specs: {},
                totalStockCache: 2,
                totalSalesCache: 0,
                isQuoteOnly: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              },
            },
          ],
        };

        mockFindFirst.mockResolvedValueOnce(mockQuoteDetails);

        // Mock insert 1: Creating Order
        const mockOrder = {
          id: "order-1",
          userId: "user-1",
          status: "PENDING" as const,
          shippingFee: "0.00",
          shippingAddress: QUOTE_CONSTANTS.DEFAULT_SHIPPING_ADDRESS,
          totalAmount: "1800.00",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockReturning.mockResolvedValueOnce([mockOrder]);

        const result = await quotesService.approveAndConvertToOrder(
          "quote-1",
          "admin-1",
        );

        expect(mockFindFirst).toHaveBeenCalledTimes(1);
        expect(mockInsert).toHaveBeenCalledTimes(3);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ orderId: "order-1" });
      });
    });
  });
});
