import { beforeEach, describe, expect, test } from "bun:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CartService } from "./cart.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";

describe("CartService", () => {
  let service: CartService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new CartService(mockDb as unknown as DrizzleDB);
  });

  describe("getOrCreateCart()", () => {
    describe("when user cart already exists", () => {
      test("should fetch cart, join items, and compute line totals and summary", async () => {
        const mockCart = {
          id: "cart-1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockCartItemRow = {
          item: {
            id: "item-1",
            cartId: "cart-1",
            productId: "prod-1",
            quantity: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          product: {
            id: "prod-1",
            nameVi: "Máy phát điện Hyundai 60kVA",
            nameEn: "Hyundai 60kVA Generator",
            slug: "may-phat-dien-hyundai-60kva",
            price: "245000000.00",
            images: ["img1.jpg"],
            totalStockCache: 5,
            isActive: true,
          },
        };

        // 1st select: find cart
        // 2nd select: fetchCartItems
        mockDb.setSelectResultsQueue([[mockCart], [mockCartItemRow]]);

        const result = await service.getOrCreateCart("user-1");

        expect(result.id).toBe("cart-1");
        expect(result.items.length).toBe(1);
        expect(result.summary.totalItems).toBe(2);
        expect(result.summary.totalAmount).toBe("490000000.00");
        expect(result.items[0]?.lineTotal).toBe("490000000.00");
      });
    });
  });

  describe("addItem()", () => {
    describe("when product is out of stock", () => {
      test("should throw BadRequestException", () => {
        const outOfStockProduct = {
          id: "prod-zero",
          nameVi: "Máy hết hàng",
          totalStockCache: 0,
          isActive: true,
        };

        mockDb.setSelectResult([outOfStockProduct]);

        expect(
          service.addItem("user-1", {
            productId: "prod-zero",
            quantity: 1,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("when product does not exist or is inactive", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(
          service.addItem("user-1", {
            productId: "non-existent",
            quantity: 1,
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe("when requested quantity exceeds available stock", () => {
      test("should throw BadRequestException", () => {
        const limitedProduct = {
          id: "prod-lim",
          nameVi: "Máy có hạn",
          totalStockCache: 3,
          isActive: true,
        };

        const existingCart = { id: "cart-1" };

        // 1st select: product check (stock: 3)
        // 2nd select: getOrCreateCartEntity
        // 3rd select: existing cart item (already has 2)
        mockDb.setSelectResultsQueue([
          [limitedProduct],
          [existingCart],
          [{ id: "item-1", quantity: 2 }],
        ]);

        expect(
          service.addItem("user-1", {
            productId: "prod-lim",
            quantity: 2, // 2 + 2 = 4 > 3
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("updateItemQuantity()", () => {
    describe("when cart item does not exist or does not belong to user", () => {
      test("should throw NotFoundException", () => {
        // 1st select: getOrCreateCartEntity
        // 2nd select: item join query (not found)
        mockDb.setSelectResultsQueue([[{ id: "cart-1" }], []]);

        expect(
          service.updateItemQuantity("user-1", "non-existent-item", {
            quantity: 2,
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("removeItem()", () => {
    describe("when item exists in user cart", () => {
      test("should delete item and return updated cart", async () => {
        const existingCart = { id: "cart-1", userId: "user-1" };

        // 1. getOrCreateCartEntity
        // 2. select existing item
        // 3. getOrCreateCart (cart select)
        // 4. getOrCreateCart (items select: empty)
        mockDb.setSelectResultsQueue([
          [existingCart],
          [{ id: "item-del" }],
          [existingCart],
          [],
        ]);

        const result = await service.removeItem("user-1", "item-del");

        expect(mockDb.delete).toHaveBeenCalled();
        expect(result.items.length).toBe(0);
      });
    });
  });

  describe("mergeGuestCart()", () => {
    describe("when guest items provided", () => {
      test("should clamp guest item quantity to current active product stock", async () => {
        const userCart = { id: "cart-1", userId: "user-1" };

        const productA = {
          id: "prod-a",
          totalStockCache: 3, // stock is 3
          isActive: true,
        };

        const existingItemA = {
          id: "item-a",
          cartId: "cart-1",
          productId: "prod-a",
          quantity: 1, // user already has 1
        };

        // tx operations:
        // 1. tx.select cart: [userCart]
        // 2. tx.select products: [productA]
        // 3. tx.select existing cartItems: [existingItemA]
        // 4. getOrCreateCart (outside tx):
        //    - cart: [userCart]
        //    - items: [mock item with clamped qty 3]
        mockDb.setSelectResultsQueue([
          [userCart],
          [productA],
          [existingItemA],
          [userCart],
          [
            {
              item: {
                id: "item-a",
                cartId: "cart-1",
                productId: "prod-a",
                quantity: 3, // clamped to stock 3
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              product: {
                id: "prod-a",
                nameVi: "Máy A",
                nameEn: null,
                slug: "may-a",
                price: "10000000.00",
                images: [],
                totalStockCache: 3,
                isActive: true,
              },
            },
          ],
        ]);

        // Guest wants to add 5 items, but user has 1, total desired = 6, capped at 3
        const result = await service.mergeGuestCart("user-1", {
          items: [{ productId: "prod-a", quantity: 5 }],
        });

        expect(result.items.length).toBe(1);
        expect(result.items[0]?.quantity).toBe(3);
      });
    });
  });
});
