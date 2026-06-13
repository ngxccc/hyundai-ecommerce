import { eq, and } from "drizzle-orm";
import type { IDatabase } from "../../client";
import { carts, cartItems, type TCart, type TCartItem } from "../../schemas";
import type {
  ICartService,
  ILocalItem,
  TCartItemWithProduct,
} from "../interfaces";

export class CartService implements ICartService {
  constructor(protected readonly db: IDatabase) {}

  async getOrCreateCart(userId: string): Promise<TCart> {
    const existingCart = await this.db.query.carts.findFirst({
      where: {
        userId,
      },
    });
    if (existingCart) {
      return existingCart;
    }
    const [newCart] = await this.db
      .insert(carts)
      .values({ userId })
      .returning();
    if (!newCart) {
      throw new Error("errors.createCartFailed");
    }
    return newCart;
  }

  async getCartById(cartId: string): Promise<TCart | null> {
    const record = await this.db.query.carts.findFirst({
      where: {
        id: cartId,
      },
    });
    return record ?? null;
  }

  async getCartItems(cartId: string): Promise<TCartItemWithProduct[]> {
    const items = await this.db.query.cartItems.findMany({
      where: {
        cartId,
      },
      with: {
        product: {
          where: {
            deletedAt: { isNull: true },
          },
        },
      },
    });
    return items;
  }

  async addToCart(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<TCartItem> {
    if (quantity <= 0) {
      throw new Error("errors.invalidQuantity");
    }

    return await this.db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: {
          id: productId,
          deletedAt: { isNull: true },
        },
      });

      if (!product) {
        throw new Error("errors.productNotFound");
      }

      if (product.isQuoteOnly) {
        throw new Error("errors.productIsQuoteOnly");
      }

      const existingItem = await tx.query.cartItems.findFirst({
        where: {
          cartId,
          productId,
        },
      });

      const currentQty = existingItem?.quantity ?? 0;
      const targetQty = currentQty + quantity;

      if (targetQty > product.totalStockCache) {
        throw new Error("errors.insufficientStock");
      }

      const [upsertedItem] = await tx
        .insert(cartItems)
        .values({
          cartId,
          productId,
          quantity: targetQty,
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: {
            quantity: targetQty,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!upsertedItem) {
        throw new Error("errors.addToCartFailed");
      }

      return upsertedItem;
    });
  }

  async updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<TCartItem | null> {
    if (quantity <= 0) {
      await this.removeFromCart(cartId, productId);
      return null;
    }

    return await this.db.transaction(async (tx) => {
      const product = await tx.query.products.findFirst({
        where: {
          id: productId,
          deletedAt: { isNull: true },
        },
      });

      if (!product) {
        throw new Error("errors.productNotFound");
      }

      if (product.isQuoteOnly) {
        throw new Error("errors.productIsQuoteOnly");
      }

      if (quantity > product.totalStockCache) {
        throw new Error("errors.insufficientStock");
      }

      const [updatedItem] = await tx
        .update(cartItems)
        .set({
          quantity,
          updatedAt: new Date(),
        })
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
        )
        .returning();

      return updatedItem ?? null;
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
    localItems: ILocalItem[],
  ): Promise<TCart> {
    return await this.db.transaction(async (tx) => {
      const userCart = await this.getOrCreateCart(userId);

      for (const localItem of localItems) {
        if (localItem.quantity <= 0) {
          continue;
        }

        const product = await tx.query.products.findFirst({
          where: {
            id: localItem.productId,
            deletedAt: { isNull: true },
          },
        });

        if (!product || product.isQuoteOnly) {
          continue;
        }

        const existingUserItem = await tx.query.cartItems.findFirst({
          where: {
            cartId: userCart.id,
            productId: localItem.productId,
          },
        });

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

      return userCart;
    });
  }
}
