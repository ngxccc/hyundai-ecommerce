import { beforeEach, describe, expect, test, mock } from "bun:test";
import { CartController } from "./cart.controller";
import type { CartService } from "./cart.service";
import type { CartResponseDto } from "./dto/cart-response.dto";
import type { AddCartItemDto } from "./dto/add-cart-item.dto";
import type { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import type { MergeCartDto } from "./dto/merge-cart.dto";

describe("CartController", () => {
  let controller: CartController;

  const mockCart: CartResponseDto = {
    id: "cart-1",
    userId: "user-1",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        quantity: 2,
        lineTotal: "490000000.00",
        product: {
          id: "prod-1",
          nameVi: "Máy phát điện",
          nameEn: null,
          slug: "may-phat-dien",
          price: "245000000.00",
          images: [],
          totalStockCache: 5,
          isActive: true,
          isOutOfStock: false,
        },
        createdAt: new Date("2026-09-04T08:00:00.000Z"),
        updatedAt: new Date("2026-09-04T08:00:00.000Z"),
      },
    ],
    summary: {
      totalItems: 2,
      totalAmount: "490000000.00",
    },
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockCartService = {
    getOrCreateCart: mock((_userId: string) => Promise.resolve(mockCart)),
    addItem: mock((_userId: string, _dto: AddCartItemDto) =>
      Promise.resolve(mockCart),
    ),
    updateItemQuantity: mock(
      (_userId: string, _itemId: string, _dto: UpdateCartItemDto) =>
        Promise.resolve(mockCart),
    ),
    removeItem: mock((_userId: string, _itemId: string) =>
      Promise.resolve(mockCart),
    ),
    mergeGuestCart: mock((_userId: string, _dto: MergeCartDto) =>
      Promise.resolve(mockCart),
    ),
    clearAll() {
      this.getOrCreateCart.mockClear();
      this.addItem.mockClear();
      this.updateItemQuantity.mockClear();
      this.removeItem.mockClear();
      this.mergeGuestCart.mockClear();
    },
  };

  beforeEach(() => {
    mockCartService.clearAll();
    controller = new CartController(mockCartService as unknown as CartService);
  });

  describe("GET /cart", () => {
    describe("when client queries current user cart", () => {
      test("should return wrapped cart response", async () => {
        const result = await controller.getCart("user-1");

        expect(mockCartService.getOrCreateCart).toHaveBeenCalledWith("user-1");
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("cart-1");
        expect(result.data.summary.totalItems).toBe(2);
      });
    });
  });

  describe("POST /cart/items", () => {
    describe("when user adds item to cart", () => {
      test("should return wrapped updated cart", async () => {
        const dto: AddCartItemDto = {
          productId: "prod-1",
          quantity: 2,
        };

        const result = await controller.addItem("user-1", dto);

        expect(mockCartService.addItem).toHaveBeenCalledWith("user-1", dto);
        expect(result.data.items.length).toBe(1);
      });
    });
  });

  describe("PUT /cart/items/:id", () => {
    describe("when user updates item quantity", () => {
      test("should return wrapped updated cart", async () => {
        const dto: UpdateCartItemDto = { quantity: 3 };

        const result = await controller.updateItemQuantity(
          "user-1",
          "item-1",
          dto,
        );

        expect(mockCartService.updateItemQuantity).toHaveBeenCalledWith(
          "user-1",
          "item-1",
          dto,
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe("DELETE /cart/items/:id", () => {
    describe("when user removes item from cart", () => {
      test("should return wrapped cart response", async () => {
        const result = await controller.removeItem("user-1", "item-1");

        expect(mockCartService.removeItem).toHaveBeenCalledWith(
          "user-1",
          "item-1",
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe("POST /cart/merge", () => {
    describe("when client submits guest cart for merging", () => {
      test("should return wrapped merged cart response", async () => {
        const dto: MergeCartDto = {
          items: [{ productId: "prod-1", quantity: 2 }],
        };

        const result = await controller.mergeGuestCart("user-1", dto);

        expect(mockCartService.mergeGuestCart).toHaveBeenCalledWith(
          "user-1",
          dto,
        );
        expect(result.success).toBe(true);
      });
    });
  });
});
