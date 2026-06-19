import { eq, and, isNull } from "drizzle-orm";
import type { IDatabase } from "../../client";
import { carts, cartItems, products } from "../../schemas";
import type { CartService, LocalItem } from "../interfaces";
import {
  type CartItemDTO,
  CART_ITEM_COLUMNS,
  CART_ITEM_PRODUCT_COLUMNS,
} from "../../dtos";

export class DbCartService implements CartService {
  constructor(protected readonly db: IDatabase) {}

  async getOrCreateCart(userId: string): Promise<{ id: string }> {
    const [existingCart] = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existingCart) {
      return existingCart;
    }

    const [newCart] = await this.db.insert(carts).values({ userId }).returning({
      id: carts.id,
    });

    if (!newCart) {
      throw new Error("errors.createCartFailed");
    }

    return newCart;
  }

  async getCartById(cartId: string): Promise<{ id: string } | undefined> {
    const [record] = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    return record;
  }

  async getCartItems(cartId: string): Promise<CartItemDTO[]> {
    const items = await this.db.query.cartItems.findMany({
      where: {
        cartId,
      },
      columns: CART_ITEM_COLUMNS,
      with: {
        product: {
          where: {
            deletedAt: { isNull: true },
          },
          columns: CART_ITEM_PRODUCT_COLUMNS,
        },
      },
    });

    return items;
  }

  async addToCart(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new Error("errors.invalidQuantity");
    }

    await this.db.transaction(async (tx) => {
      // 1. Lock the product row (pessimistic lock)
      const [product] = await tx
        .select({
          totalStockCache: products.totalStockCache,
          isQuoteOnly: products.isQuoteOnly,
        })
        .from(products)
        .where(and(eq(products.id, productId), isNull(products.deletedAt)))
        .for("update");

      if (!product) {
        throw new Error("errors.productNotFound");
      }

      if (product.isQuoteOnly) {
        throw new Error("errors.productIsQuoteOnly");
      }

      // 2. Lock the cart item row (pessimistic lock)
      const [existingItem] = await tx
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
        })
        .from(cartItems)
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
        )
        .for("update");

      const currentQty = existingItem?.quantity ?? 0;
      const targetQty = currentQty + quantity;

      if (targetQty > product.totalStockCache) {
        throw new Error("errors.insufficientStock");
      }

      if (existingItem) {
        await tx
          .update(cartItems)
          .set({ quantity: targetQty })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        await tx.insert(cartItems).values({
          cartId,
          productId,
          quantity: targetQty,
        });
      }
    });
  }

  async updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(cartId, productId);
      return;
    }

    await this.db.transaction(async (tx) => {
      // 1. Lock the product row (pessimistic lock)
      const [product] = await tx
        .select({
          totalStockCache: products.totalStockCache,
          isQuoteOnly: products.isQuoteOnly,
        })
        .from(products)
        .where(and(eq(products.id, productId), isNull(products.deletedAt)))
        .for("update");

      if (!product) {
        throw new Error("errors.productNotFound");
      }

      if (product.isQuoteOnly) {
        throw new Error("errors.productIsQuoteOnly");
      }

      if (quantity > product.totalStockCache) {
        throw new Error("errors.insufficientStock");
      }

      // 2. Lock the cart item row (pessimistic lock)
      const [existingItem] = await tx
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
        )
        .for("update");

      if (!existingItem) {
        return undefined;
      }

      await tx
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, existingItem.id));
    });
  }

  async removeFromCart(cartId: string, productId: string): Promise<void> {
    await this.db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
      );
  }

  async mergeLocalItems(
    userId: string,
    localItems: LocalItem[],
  ): Promise<void> {
    return await this.db.transaction(async (tx) => {
      const userCart = await this.getOrCreateCart(userId);

      for (const localItem of localItems) {
        if (localItem.quantity <= 0) {
          continue;
        }

        // 1. Lock the product row (pessimistic lock)
        const [product] = await tx
          .select({
            totalStockCache: products.totalStockCache,
            isQuoteOnly: products.isQuoteOnly,
          })
          .from(products)
          .where(
            and(
              eq(products.id, localItem.productId),
              isNull(products.deletedAt),
            ),
          )
          .for("update");

        if (!product || product.isQuoteOnly) {
          continue;
        }

        // 2. Lock the cart item row (pessimistic lock)
        const [existingUserItem] = await tx
          .select({
            id: cartItems.id,
            quantity: cartItems.quantity,
          })
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, userCart.id),
              eq(cartItems.productId, localItem.productId),
            ),
          )
          .for("update");

        if (existingUserItem) {
          const sumQty = existingUserItem.quantity + localItem.quantity;
          const finalQty = Math.min(sumQty, product.totalStockCache);

          await tx
            .update(cartItems)
            .set({
              quantity: finalQty,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingUserItem.id));
        } else {
          const finalQty = Math.min(
            localItem.quantity,
            product.totalStockCache,
          );
          await tx.insert(cartItems).values({
            cartId: userCart.id,
            productId: localItem.productId,
            quantity: finalQty,
          });
        }
      }
    });
  }
}
