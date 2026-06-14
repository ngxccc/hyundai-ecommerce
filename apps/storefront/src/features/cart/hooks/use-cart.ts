import { useIsMounted } from "@/shared/hooks/useIsMounted";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: string;
  image: string;
  totalStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncWithServer: (serverItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item, quantity) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId,
          );

          if (existingItem) {
            const targetQty = existingItem.quantity + quantity;
            const finalQty = Math.min(targetQty, item.totalStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: finalQty }
                  : i,
              ),
            };
          }

          const newQty = Math.min(quantity, item.totalStock);
          if (newQty <= 0) return {};

          return {
            items: [...state.items, { ...item, quantity: newQty }],
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) => {
              if (i.productId === productId) {
                return { ...i, quantity: Math.min(quantity, i.totalStock) };
              }
              return i;
            }),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
      syncWithServer: (serverItems) => set({ items: serverItems }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useCart<T>(selector: (state: CartState) => T): T | undefined {
  const store = useCartStore(selector);
  const isMounted = useIsMounted();
  return isMounted ? store : undefined;
}
