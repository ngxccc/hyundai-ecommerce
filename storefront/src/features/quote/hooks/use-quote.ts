import { useIsClient } from "@/hooks/useIsClient";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";

export interface QuoteItem {
  id: string;
  productId?: string | null;
  isCustomItem?: boolean;
  quantity: number;
  name: string;
  model?: string | null;
  specs?: string | null;
  price: string;
  requestedPrice?: string | null;
  image: string;
  totalStock?: number;
}

export interface AddCatalogItemInput {
  productId: string;
  name: string;
  price: string;
  image: string;
  totalStock?: number;
  requestedPrice?: string | null;
}

export interface AddCustomItemInput {
  name: string;
  model?: string | null;
  specs?: string | null;
  quantity?: number;
  requestedPrice?: string | null;
}

export function createQuoteItem(
  item: Omit<QuoteItem, "quantity" | "id"> & { id?: string },
  quantity: number,
): QuoteItem {
  return {
    id: item.id ?? item.productId ?? `custom-${Date.now()}`,
    productId: item.productId,
    isCustomItem: item.isCustomItem ?? false,
    quantity,
    name: item.name,
    model: item.model ?? null,
    specs: item.specs ?? null,
    price: item.price,
    requestedPrice: item.requestedPrice ?? null,
    image: item.image,
    totalStock: item.totalStock,
  };
}

interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: AddCatalogItemInput, quantity?: number) => void;
  addCustomItem: (item: AddCustomItemInput) => void;
  updateQuantity: (idOrProductId: string, quantity: number) => void;
  updateRequestedPrice: (
    idOrProductId: string,
    requestedPrice: string | null,
  ) => void;
  removeItem: (idOrProductId: string) => void;
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
              (i) => !i.isCustomItem && i.productId === item.productId,
            );
            if (existing) {
              existing.quantity += quantity;
            } else {
              state.items.push({
                id: item.productId,
                productId: item.productId,
                isCustomItem: false,
                name: item.name,
                price: item.price,
                image: item.image,
                totalStock: item.totalStock,
                requestedPrice: item.requestedPrice ?? null,
                quantity,
              });
            }
          }),
        ),
      addCustomItem: (item) =>
        set(
          produce((state: QuoteState) => {
            const customId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            state.items.push({
              id: customId,
              productId: null,
              isCustomItem: true,
              name: item.name.trim(),
              model: item.model?.trim() ?? null,
              specs: item.specs?.trim() ?? null,
              price: "0",
              image: "",
              requestedPrice: item.requestedPrice?.trim() ?? null,
              quantity: Math.max(1, item.quantity ?? 1),
            });
          }),
        ),
      updateQuantity: (idOrProductId, quantity) =>
        set(
          produce((state: QuoteState) => {
            const target = state.items.find(
              (i) => i.id === idOrProductId || i.productId === idOrProductId,
            );
            if (target) {
              target.quantity = Math.max(1, quantity);
            }
          }),
        ),
      updateRequestedPrice: (idOrProductId, requestedPrice) =>
        set(
          produce((state: QuoteState) => {
            const target = state.items.find(
              (i) => i.id === idOrProductId || i.productId === idOrProductId,
            );
            if (target) {
              target.requestedPrice = requestedPrice?.trim() ?? null;
            }
          }),
        ),
      removeItem: (idOrProductId) =>
        set(
          produce((state: QuoteState) => {
            state.items = state.items.filter(
              (i) => i.id !== idOrProductId && i.productId !== idOrProductId,
            );
          }),
        ),
      clearQuote: () => set({ items: [] }),
    }),
    {
      name: "hyundai-b2b-quote-list",
      version: 1,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<QuoteState> | undefined;
        if (state && Array.isArray(state.items)) {
          state.items = state.items.map(
            (item: Partial<QuoteItem>, idx: number) =>
              ({
                ...item,
                id: item.id ?? item.productId ?? `item-${Date.now()}-${idx}`,
              }) as QuoteItem,
          );
        }
        return state as QuoteState;
      },
    },
  ),
);

export function useQuote<T>(selector: (state: QuoteState) => T): T | undefined {
  const isMounted = useIsClient();
  const storeValue = useQuoteStore(selector);
  return isMounted ? storeValue : undefined;
}
