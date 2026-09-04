import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import { cartItems, carts, products } from "@/database/schemas";
import type {
  AddCartItemDto,
  CartItemResponseDto,
  CartResponseDto,
  MergeCartDto,
  UpdateCartItemDto,
} from "./dto";

/**
 * Service managing user shopping cart operations, stock validation, and inventory-clamped guest cart merging.
 */
@Injectable()
export class CartService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Retrieves or lazily creates a cart for the specified user with calculated line totals.
   */
  async getOrCreateCart(userId: string): Promise<CartResponseDto> {
    let [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (!cart) {
      const [newCart] = await this.db
        .insert(carts)
        .values({ userId })
        .returning();

      if (!newCart) {
        throw new BadRequestException("Failed to initialize user cart");
      }
      cart = newCart;
    }

    const items = await this.fetchCartItems(cart.id);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items
      .reduce((sum, item) => sum + Number(item.lineTotal), 0)
      .toFixed(2);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      summary: {
        totalItems,
        totalAmount,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Adds an item to the user's cart or increments existing quantity with stock boundary validation.
   */
  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponseDto> {
    // 1. Verify product exists, is active, and has available inventory
    const [product] = await this.db
      .select({
        id: products.id,
        nameVi: products.nameVi,
        totalStockCache: products.totalStockCache,
        isActive: products.isActive,
      })
      .from(products)
      .where(and(eq(products.id, dto.productId), isNull(products.deletedAt)))
      .limit(1);

    if (!product?.isActive) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found or unavailable`,
      );
    }

    if (product.totalStockCache <= 0) {
      throw new BadRequestException(
        `Product "${product.nameVi}" is out of stock`,
      );
    }

    const cart = await this.getOrCreateCartEntity(userId);

    // 2. Check if product already exists in cart
    const [existingItem] = await this.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, dto.productId),
        ),
      )
      .limit(1);

    const newQuantity = (existingItem?.quantity ?? 0) + dto.quantity;

    if (newQuantity > product.totalStockCache) {
      throw new BadRequestException(
        `Requested quantity (${String(newQuantity)}) exceeds available stock (${String(product.totalStockCache)})`,
      );
    }

    if (existingItem) {
      await this.db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await this.db.insert(cartItems).values({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }

    return this.getOrCreateCart(userId);
  }

  /**
   * Updates quantity of a specific cart item belonging to the user.
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCartEntity(userId);

    const [itemWithProduct] = await this.db
      .select({
        item: cartItems,
        product: {
          id: products.id,
          nameVi: products.nameVi,
          totalStockCache: products.totalStockCache,
          isActive: products.isActive,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);

    if (!itemWithProduct) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }

    if (dto.quantity > itemWithProduct.product.totalStockCache) {
      throw new BadRequestException(
        `Requested quantity (${String(dto.quantity)}) exceeds available stock (${String(itemWithProduct.product.totalStockCache)})`,
      );
    }

    await this.db
      .update(cartItems)
      .set({
        quantity: dto.quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId));

    return this.getOrCreateCart(userId);
  }

  /**
   * Removes an item from the user's cart.
   */
  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCartEntity(userId);

    const [existing] = await this.db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }

    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));

    return this.getOrCreateCart(userId);
  }

  /**
   * Merges guest cart items into authenticated user cart, clamping quantities to active product stock.
   */
  async mergeGuestCart(
    userId: string,
    dto: MergeCartDto,
  ): Promise<CartResponseDto> {
    if (dto.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    await this.db.transaction(async (tx) => {
      // 1. Get or create user cart entity within transaction
      let [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);

      if (!cart) {
        const [created] = await tx.insert(carts).values({ userId }).returning();
        if (!created) {
          throw new BadRequestException("Failed to initialize user cart");
        }
        cart = created;
      }

      // 2. Fetch all products referenced in guest cart
      const productIds = dto.items.map((i) => i.productId);
      const productRecords = await tx
        .select({
          id: products.id,
          totalStockCache: products.totalStockCache,
          isActive: products.isActive,
        })
        .from(products)
        .where(
          and(inArray(products.id, productIds), isNull(products.deletedAt)),
        );

      const productMap = new Map(productRecords.map((p) => [p.id, p]));

      // 3. Fetch current items in user's cart
      const existingUserCartItems = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));

      const cartItemMap = new Map(
        existingUserCartItems.map((item) => [item.productId, item]),
      );

      // 4. Process each guest item and clamp to product stock
      for (const guestItem of dto.items) {
        const product = productMap.get(guestItem.productId);

        // Skip unavailable or completely out of stock products
        if (!product || !product.isActive || product.totalStockCache <= 0) {
          continue;
        }

        const existingItem = cartItemMap.get(guestItem.productId);
        const desiredQuantity =
          (existingItem?.quantity ?? 0) + guestItem.quantity;

        // Requirement: "Cart merge logic clamps quantities to current active product stock"
        const finalQuantity = Math.min(
          desiredQuantity,
          product.totalStockCache,
        );

        if (finalQuantity <= 0) {
          continue;
        }

        if (existingItem) {
          await tx
            .update(cartItems)
            .set({
              quantity: finalQuantity,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingItem.id));
        } else {
          await tx.insert(cartItems).values({
            cartId: cart.id,
            productId: guestItem.productId,
            quantity: finalQuantity,
          });
        }
      }
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Fetches full cart item rows with joined product data and computed line totals.
   */
  private async fetchCartItems(cartId: string): Promise<CartItemResponseDto[]> {
    const records = await this.db
      .select({
        item: cartItems,
        product: {
          id: products.id,
          nameVi: products.nameVi,
          nameEn: products.nameEn,
          slug: products.slug,
          price: products.price,
          images: products.images,
          totalStockCache: products.totalStockCache,
          isActive: products.isActive,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(and(eq(cartItems.cartId, cartId), isNull(products.deletedAt)))
      .orderBy(asc(cartItems.createdAt));

    return records.map((r): CartItemResponseDto => {
      const unitPrice = Number(r.product.price);
      const lineTotal = (unitPrice * r.item.quantity).toFixed(2);
      const isOutOfStock = r.product.totalStockCache <= 0;

      return {
        id: r.item.id,
        productId: r.item.productId,
        quantity: r.item.quantity,
        lineTotal,
        product: {
          id: r.product.id,
          nameVi: r.product.nameVi,
          nameEn: r.product.nameEn,
          slug: r.product.slug,
          price: r.product.price,
          images: r.product.images,
          totalStockCache: r.product.totalStockCache,
          isActive: r.product.isActive,
          isOutOfStock,
        },
        createdAt: r.item.createdAt,
        updatedAt: r.item.updatedAt,
      };
    });
  }

  private async getOrCreateCartEntity(userId: string): Promise<{ id: string }> {
    let [cart] = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (!cart) {
      const [newCart] = await this.db
        .insert(carts)
        .values({ userId })
        .returning({ id: carts.id });

      if (!newCart) {
        throw new BadRequestException("Failed to initialize user cart");
      }
      cart = newCart;
    }

    return cart;
  }
}
