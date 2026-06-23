import type { CartItemDTO } from "../../dtos";
import type { LocalItem } from "../product/product.interface";

export interface CartService {
  getOrCreateCart(userId: string): Promise<{ id: string }>;
  getCartById(cartId: string): Promise<{ id: string } | undefined>;
  getCartItems(cartId: string): Promise<CartItemDTO[]>;
  addToCart(cartId: string, productId: string, quantity: number): Promise<void>;
  updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
  removeFromCart(cartId: string, productId: string): Promise<void>;
  mergeLocalItems(userId: string, localItems: LocalItem[]): Promise<void>;
}
