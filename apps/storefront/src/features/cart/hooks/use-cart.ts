import { useIsMounted } from "@/shared/hooks/useIsMounted";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addToDbCartAction,
  updateDbQuantityAction,
  removeFromDbCartAction,
} from "../actions";
import { toast } from "sonner";

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
  isLoggedIn: boolean;
  isCartSynced: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsCartSynced: (isCartSynced: boolean) => void;
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity: number,
  ) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
  syncWithServer: (serverItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoggedIn: false,
      isCartSynced: true,
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsLoggedIn: (isLoggedIn) =>
        set({
          isLoggedIn,
          isCartSynced: isLoggedIn ? false : true,
        }),
      setIsCartSynced: (isCartSynced) => set({ isCartSynced }),
      addItem: async (item, quantity) => {
        // 1. Update local state immediately (Optimistic Update)
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
        });

        // 2. If logged in, sync with database
        if (get().isLoggedIn) {
          const result = await addToDbCartAction(item.productId, quantity);
          if (!result.success) {
            toast.error(result.error ?? "Failed to add item to server cart");
          }
        }
      },
      updateQuantity: async (productId, quantity) => {
        // 1. Update local state immediately
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
        });

        // 2. If logged in, sync with database
        if (get().isLoggedIn) {
          const result = await updateDbQuantityAction(productId, quantity);
          if (!result.success) {
            toast.error(result.error ?? "Failed to update quantity on server");
          }
        }
      },
      removeItem: async (productId) => {
        // 1. Update local state immediately
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));

        // 2. If logged in, sync with database
        if (get().isLoggedIn) {
          const result = await removeFromDbCartAction(productId);
          if (!result.success) {
            toast.error(result.error ?? "Failed to remove item from server");
          }
        }
      },
      clearCart: () => set({ items: [] }),
      syncWithServer: (serverItems) =>
        set({ items: serverItems, isCartSynced: true }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        // Only store items in localStorage if the user is a guest (not logged in)
        items: state.isLoggedIn ? [] : state.items,
      }),
    },
  ),
);

export function useCart<T>(selector: (state: CartState) => T): T | undefined {
  const store = useCartStore(selector);
  const isMounted = useIsMounted();
  return isMounted ? store : undefined;
}
