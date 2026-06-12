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
import { QuotesService, type ComplexQuote } from "./quotes.service";
import {
  type TQuote,
  type TQuoteItem,
  type TQuoteMessage,
  type TUser,
  type TProduct,
} from "../../schemas";
import type { IDatabase } from "../../client";

const quotesService = new QuotesService(mockDb as unknown as IDatabase);

// Mock entities representing stable database instances
const mockUser: TUser = {
  id: "user-1",
  name: "Dealer Test",
  email: "dealer@test.com",
  emailVerified: true,
  image: null,
  role: "dealer",
  dealerTierId: null,
  phone: "0901234567",
  companyName: "Hyundai Corp",
  taxId: null,
  businessType: "dealer",
  province: "HCM",
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
  specs: {
    power: 100,
    voltage: 400,
  },
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

  test("createQuote() should insert quote and items inside a transaction", async () => {
    const mockQuote: TQuote = {
      id: "quote-1",
      userId: "user-1",
      status: "pending_review",
      totalQuotedPrice: null,
      expirationDate: null,
      note: "Initial requested quote",
      orderId: null,
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
      [{ productId: "prod-1", quantity: 2, requestedPrice: "100.00" }]
    );

    expect(mockInsert).toHaveBeenCalledTimes(2); // One for quote insertion, one for items insertion
    expect(result).toEqual(mockQuote);
  });

  test("getComplexQuote() should return nested quote details", async () => {
    const mockQuoteDetails: ComplexQuote = {
      id: "quote-1",
      userId: "user-1",
      status: "pending_review",
      totalQuotedPrice: null,
      expirationDate: null,
      note: "Initial requested quote",
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
      items: [
        {
          id: "item-1",
          quoteId: "quote-1",
          productId: "prod-1",
          quantity: 2,
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
          quoteId: "quote-1",
          senderId: "user-1",
          message: "Initial offer",
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: mockUser,
        },
      ],
    };
    mockFindFirst.mockResolvedValueOnce(mockQuoteDetails);

    const result = await quotesService.getComplexQuote("quote-1");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockQuoteDetails);
  });

  test("listQuotes() should return a list of quotes", async () => {
    const mockQuotesDetails = [
      {
        id: "quote-1",
        userId: "user-1",
        status: "pending_review" as const,
        totalQuotedPrice: null,
        expirationDate: null,
        note: null,
        orderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
        items: [
          {
            id: "item-1",
            quoteId: "quote-1",
            productId: "prod-1",
            quantity: 2,
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

  test("updateQuoteStatus() should update and return the quote", async () => {
    const mockQuote: TQuote = {
      id: "quote-1",
      userId: "user-1",
      status: "negotiating",
      totalQuotedPrice: null,
      expirationDate: null,
      note: null,
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockQuote]);

    const result = await quotesService.updateQuoteStatus("quote-1", "negotiating");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockQuote);
  });

  test("addQuoteMessage() should insert and return a timeline message", async () => {
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

  test("updateQuoteItemPrice() should update agreed price of the item", async () => {
    const mockItem: TQuoteItem = {
      id: "item-1",
      quoteId: "quote-1",
      productId: "prod-1",
      quantity: 2,
      requestedPrice: "900.00",
      agreedPrice: "95.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockItem]);

    const result = await quotesService.updateQuoteItemPrice("item-1", "95.00");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockItem);
  });

  test("approveAndConvertToOrder() should process quote-to-order transition atomically inside transaction", async () => {
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
          quantity: 2,
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
          quantity: 1,
          requestedPrice: "100.00",
          agreedPrice: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: "prod-2",
            name: "Generator 50kW",
            slug: "generator-50kw",
            price: "100.00",
            description: null,
            shortDescription: null,
            images: [],
            brandId: null,
            categoryId: null,
            specs: {},
            totalStockCache: 2,
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
      status: "pending" as const,
      shippingFee: "0.00",
      shippingAddress: QUOTE_CONSTANTS.DEFAULT_SHIPPING_ADDRESS,
      totalAmount: "1800.00", // (850 * 2) + 100
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockOrder]); // Returning created order

    // Execute convert
    const result = await quotesService.approveAndConvertToOrder("quote-1", "admin-1");

    // Assert findFirst was called with quote ID
    expect(mockFindFirst).toHaveBeenCalledTimes(1);

    // Assert inserts:
    // Insert 1: Order
    // Insert 2: Order Items
    // Insert 3: Timeline message
    expect(mockInsert).toHaveBeenCalledTimes(3);

    // Assert update: Quote table status updated
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // Verify returning orderId matches the created order
    expect(result).toEqual({ orderId: "order-1" });
  });
});
