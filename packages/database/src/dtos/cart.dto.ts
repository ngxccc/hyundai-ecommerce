import { type TCartItem, type TProduct } from "../schemas";

export const CART_ITEM_COLUMNS = {
  id: true,
  productId: true,
  quantity: true,
} as const;

export const CART_ITEM_PRODUCT_COLUMNS = {
  id: true,
  nameVi: true,
  nameEn: true,
  price: true,
  images: true,
  totalStockCache: true,
  slug: true,
} as const;

export type CartItemMinimal = {
  [K in keyof typeof CART_ITEM_COLUMNS]: TCartItem[K];
};

export type CartItemProductMinimal = {
  [K in keyof typeof CART_ITEM_PRODUCT_COLUMNS]: TProduct[K];
};

export type CartItemDTO = CartItemMinimal & {
  product: CartItemProductMinimal | null;
};

export function mapCartItemToDTO(
  item: CartItemMinimal & { product: CartItemProductMinimal | null },
): CartItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: item.product
      ? {
          id: item.product.id,
          nameVi: item.product.nameVi,
          nameEn: item.product.nameEn,
          price: item.product.price,
          images: item.product.images,
          totalStockCache: item.product.totalStockCache,
          slug: item.product.slug,
        }
      : null,
  } satisfies CartItemDTO;
}
