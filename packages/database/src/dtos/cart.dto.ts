import { type TCartItem, type TProduct } from "../schemas";
import { type ProductDTO, mapProductToDTO } from "./product.dto";

export interface CartItemDTO {
  id: string;
  productId: string;
  quantity: number;
  product: ProductDTO | null;
}

export function mapCartItemToDTO(
  item: TCartItem & { product: TProduct | null },
): CartItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: item.product ? mapProductToDTO(item.product) : null,
  };
}
