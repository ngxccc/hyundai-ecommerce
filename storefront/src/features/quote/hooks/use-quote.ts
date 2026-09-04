import { useIsMounted } from "@/shared/hooks/useIsMounted";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";

export interface QuoteItem {
  productId: string;
  quantity: number;
  name: string;
  price: string;
  image: string;
  totalStock: number;
}

export function createQuoteItem(
  item: Omit<QuoteItem, "quantity">,
  quantity: number,
): QuoteItem {
  return {
    productId: item.productId,
    quantity,
    name: item.name,
    price: item.price,
    image: item.image,
    totalStock: item.totalStock,
  };
}

interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<QuoteItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearQuote: () => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item, quantity = 1) =>
        set(
          produce((state: QuoteState) => {
            const existing = state.items.find(
              (i) => i.productId === item.productId,
            );
            if (existing) {
              existing.quantity += quantity;
            } else {
              state.items.push({ ...item, quantity });
            }
          }),
        ),
      updateQuantity: (productId, quantity) =>
        set(
          produce((state: QuoteState) => {
            const target = state.items.find((i) => i.productId === productId);
            if (target) {
              target.quantity = Math.max(1, quantity);
            }
          }),
        ),
      removeItem: (productId) =>
        set(
          produce((state: QuoteState) => {
            state.items = state.items.filter((i) => i.productId !== productId);
          }),
        ),
      clearQuote: () => set({ items: [] }),
    }),
    {
      name: "hyundai-b2b-quote-list",
    },
  ),
);

export function useQuote<T>(selector: (state: QuoteState) => T): T | undefined {
  const isMounted = useIsMounted();
  const storeValue = useQuoteStore(selector);
  return isMounted ? storeValue : undefined;
}
