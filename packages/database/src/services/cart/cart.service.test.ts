import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockSelectResolvedValue,
  mockSelect,
} from "../../tests/utils/db-mock";
import { DbCartService } from "./cart.service";
import type { IDatabase } from "../../client";
import type { TCart, TCartItem } from "../../schemas";
import type { CartItemDTO } from "../../dtos";

const cartService = new DbCartService(mockDb as unknown as IDatabase);

describe("CartService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateCart()", () => {
    test("should return existing cart for authenticated user", async () => {
      const mockCart = { id: "cart-1", userId: "user-1" } as TCart;
      mockSelectResolvedValue.mockResolvedValueOnce([mockCart]);

      const result = await cartService.getOrCreateCart("user-1");

      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });

    test("should create and return new cart if none exists for authenticated user", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);
      const mockCart = { id: "cart-1", userId: "user-1" } as TCart;
      mockReturning.mockResolvedValueOnce([mockCart]);

      const result = await cartService.getOrCreateCart("user-1");

      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });
  });

  describe("getCartById()", () => {
    test("should return cart if it exists", async () => {
      const mockCart = { id: "cart-1", userId: "user-1" } as TCart;
      mockSelectResolvedValue.mockResolvedValueOnce([mockCart]);

      const result = await cartService.getCartById("cart-1");

      expect(result).toEqual(mockCart);
    });

    test("should return undefined if cart does not exist", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);

      const result = await cartService.getCartById("cart-not-exists");

      expect(result).toBeUndefined();
    });
  });


  describe("getCartItems()", () => {
    test("should return all items and keep deleted/missing products as null", async () => {
      const mockItems = [
        {
          id: "item-1",
          productId: "prod-1",
          quantity: 2,
          product: { id: "prod-1", nameVi: "Product 1", deletedAt: null },
        },
        {
          id: "item-2",
          productId: "prod-2",
          quantity: 1,
          product: null,
        },
        {
          id: "item-3",
          productId: "prod-3",
          quantity: 5,
          product: null,
        },
      ] as CartItemDTO[];
      mockFindMany.mockResolvedValueOnce(mockItems);

      const result = await cartService.getCartItems("cart-1");

      expect(mockFindMany).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0]!.id).toBe("item-1");
      expect(result[0]!.product).not.toBeNull();
      expect(result[1]!.product).toBeNull();
      expect(result[2]!.product).toBeNull();
    });
  });

  describe("addToCart()", () => {
    test("should throw error if quantity <= 0", () => {
      expect(cartService.addToCart("cart-1", "prod-1", 0)).rejects.toThrow(
        "errors.invalidQuantity",
      );
    });
    test("should throw error if product does not exist or is deleted", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // Product check

      expect(cartService.addToCart("cart-1", "prod-1", 2)).rejects.toThrow(
        "errors.productNotFound",
      );
    });

      mockSelectResolvedValue.mockResolvedValueOnce([
        {
          id: "prod-1",
          isQuoteOnly: true,
          deletedAt: null,
        },
      ]);

      expect(cartService.addToCart("cart-1", "prod-1", 2)).rejects.toThrow(
        "errors.productIsQuoteOnly",
      );

      mockSelectResolvedValue
        .mockResolvedValueOnce([
          {
            id: "prod-1",
            isQuoteOnly: false,
            deletedAt: null,
            totalStockCache: 5,
          },
        ]) // Product check
        .mockResolvedValueOnce([
          {
            id: "item-1",
            productId: "prod-1",
            quantity: 3,
          },
        ]); // Existing item check

      expect(cartService.addToCart("cart-1", "prod-1", 3)).rejects.toThrow(
        "errors.insufficientStock",
      );

    test("should insert/update item if valid", async () => {
      mockSelectResolvedValue
        .mockResolvedValueOnce([
          {
            id: "prod-1",
            isQuoteOnly: false,
            deletedAt: null,
            totalStockCache: 10,
          },
        ]) // Product check
        .mockResolvedValueOnce([]); // Existing item check

      const mockCartItem = {
        id: "item-new",
        productId: "prod-1",
        quantity: 2,
      } as TCartItem;
      mockReturning.mockResolvedValueOnce([mockCartItem]);

      const result = await cartService.addToCart("cart-1", "prod-1", 2);

      expect(mockInsert).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("updateCartItemQuantity()", () => {
    test("should remove item and return undefined if quantity <= 0", async () => {
      const result = await cartService.updateCartItemQuantity(
        "cart-1",
        "prod-1",
        0,
      );

      expect(mockDelete).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
    test("should throw error if product not found", () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);

      expect(
        cartService.updateCartItemQuantity("cart-1", "prod-1", 5),
      ).rejects.toThrow("errors.productNotFound");
    });

      mockSelectResolvedValue.mockResolvedValueOnce([
        {
          id: "prod-1",
          isQuoteOnly: false,
          deletedAt: null,
          totalStockCache: 3,
        },
      ]);

      expect(
        cartService.updateCartItemQuantity("cart-1", "prod-1", 5),
      ).rejects.toThrow("errors.insufficientStock");

    test("should update and return item if valid", async () => {
      mockSelectResolvedValue
        .mockResolvedValueOnce([
          {
            id: "prod-1",
            isQuoteOnly: false,
            deletedAt: null,
            totalStockCache: 10,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "item-1",
          },
        ]);

      const mockCartItem = {
        id: "item-1",
        productId: "prod-1",
        quantity: 5,
      } as TCartItem;
      mockReturning.mockResolvedValueOnce([mockCartItem]);

      const result = await cartService.updateCartItemQuantity(
        "cart-1",
        "prod-1",
        5,
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("removeFromCart()", () => {
    test("should delete the item from the cart", async () => {
      await cartService.removeFromCart("cart-1", "prod-1");

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("mergeLocalItems()", () => {
    test("should merge items into user's cart, capping at available stock", async () => {
      const userCart = {
        id: "cart-user",
        userId: "user-1",
      } as TCart;
      mockSelectResolvedValue
        .mockResolvedValueOnce([userCart]) // User cart check (inside getOrCreateCart)
        .mockResolvedValueOnce([
          {
            id: "prod-1",
            totalStockCache: 10,
            deletedAt: null,
          },
        ]) // Product check
        .mockResolvedValueOnce([
          {
            id: "item-user",
            productId: "prod-1",
            quantity: 2,
          },
        ]); // Existing user item check

      const localItems = [
        {
          productId: "prod-1",
          quantity: 3,
        },
      ];

      const result = await cartService.mergeLocalItems("user-1", localItems);

      expect(mockUpdate).toHaveBeenCalled(); // Should update existing user item
      expect(result).toBeUndefined();
    });
    test("should insert new item into user's cart if not already present", async () => {
      const userCart = {
        id: "cart-user",
        userId: "user-1",
      } as TCart;
      mockSelectResolvedValue
        .mockResolvedValueOnce([userCart]) // User cart check (inside getOrCreateCart)
        .mockResolvedValueOnce([
          {
            id: "prod-1",
            totalStockCache: 10,
            deletedAt: null,
          },
        ]) // Product check
        .mockResolvedValueOnce([]); // Existing user item check (none)

      const localItems = [
        {
          productId: "prod-1",
          quantity: 3,
        },
      ];

      const result = await cartService.mergeLocalItems("user-1", localItems);

      expect(mockInsert).toHaveBeenCalled(); // Should insert new user item
      expect(result).toBeUndefined();
    });
  });
});
