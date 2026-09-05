import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductDTO } from "@/shared/types/admin-schema.types";

export interface AdminQuoteDraftItem {
  id: string; // Client-side unique row identifier
  productId: string | null;
  isCustomItem: boolean;
  itemName: string;
  itemModel: string | null;
  itemSpecs: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  image: string | null;
}

export interface AdminQuoteCustomerInfo {
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  companyName: string | null;
  taxId: string | null;
  shippingAddress: string | null;
}

export interface AdminQuoteCommercialTerms {
  validityDays: number;
  vatRate: number;
  paymentSchedule: string | null;
  warrantyTerms: string | null;
  deliveryTime: string | null;
  deliveryLocation: string | null;
  note: string | null;
}

interface QuoteDraftState {
  items: AdminQuoteDraftItem[];
  customerInfo: AdminQuoteCustomerInfo;
  commercialTerms: AdminQuoteCommercialTerms;

  // Actions for item management
  addProduct: (product: ProductDTO, quantity?: number) => void;
  addCustomItem: (item: {
    itemName: string;
    itemModel?: string | null;
    itemSpecs?: string | null;
    unitPrice: number;
    quantity?: number;
    discountPercent?: number;
  }) => void;
  updateItem: (id: string, patch: Partial<AdminQuoteDraftItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;

  // Actions for customer & terms
  setCustomerInfo: (info: Partial<AdminQuoteCustomerInfo>) => void;
  setCommercialTerms: (terms: Partial<AdminQuoteCommercialTerms>) => void;
  resetDraft: () => void;
}

const defaultCustomerInfo: AdminQuoteCustomerInfo = {
  userId: null,
  customerName: "",
  customerPhone: "",
  customerEmail: null,
  companyName: null,
  taxId: null,
  shippingAddress: null,
};

const defaultCommercialTerms: AdminQuoteCommercialTerms = {
  validityDays: 15,
  vatRate: 10,
  paymentSchedule: "Thanh toán 30% khi đặt hàng, 70% trước khi giao hàng",
  warrantyTerms: "12 tháng hoặc 1000 giờ chạy máy tùy điều kiện nào đến trước",
  deliveryTime: "3 - 5 ngày làm việc",
  deliveryLocation: "",
  note: null,
};

export const useQuoteDraftStore = create<QuoteDraftState>()(
  persist(
    (set) => ({
      items: [],
      customerInfo: defaultCustomerInfo,
      commercialTerms: defaultCommercialTerms,

      addProduct: (product, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === product.id && !i.isCustomItem,
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            };
            return { items: updatedItems };
          }

          // Extract generator specifications for quote display
          const specsRecord = product.specs ?? {};
          const model =
            typeof specsRecord.model === "string" ? specsRecord.model : null;
          const power =
            specsRecord.power ??
            specsRecord.standbyPowerKva ??
            specsRecord.primePowerKva;
          const phase = specsRecord.phase;
          const fuelType = specsRecord.fuelType;

          const powerStr =
            typeof power === "number" || typeof power === "string"
              ? `${power}kVA`
              : null;
          const phaseStr =
            typeof phase === "string"
              ? phase === "1phase"
                ? "1 Pha"
                : phase === "3phase"
                  ? "3 Pha"
                  : phase
              : null;
          const fuelStr = typeof fuelType === "string" ? fuelType : null;

          const specsSummary = [powerStr, phaseStr, fuelStr]
            .filter(Boolean)
            .join(", ");

          const newItem: AdminQuoteDraftItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            isCustomItem: false,
            itemName: product.nameVi,
            itemModel: model ?? product.slug,
            itemSpecs: specsSummary || null,
            quantity,
            unitPrice: parseFloat(product.price),
            discountPercent: 0,
            image: product.images[0] ?? null,
          };

          return { items: [...state.items, newItem] };
        }),

      addCustomItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              productId: null,
              isCustomItem: true,
              itemName: item.itemName,
              itemModel: item.itemModel ?? null,
              itemSpecs: item.itemSpecs ?? null,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent ?? 0,
              image: null,
            },
          ],
        })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearItems: () => set({ items: [] }),

      setCustomerInfo: (info) =>
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        })),

      setCommercialTerms: (terms) =>
        set((state) => ({
          commercialTerms: { ...state.commercialTerms, ...terms },
        })),

      resetDraft: () =>
        set({
          items: [],
          customerInfo: defaultCustomerInfo,
          commercialTerms: defaultCommercialTerms,
        }),
    }),
    {
      name: "hyundai_admin_quote_draft",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {
            // No-op storage mock for SSR/testing
          },
          removeItem: () => {
            // No-op storage mock for SSR/testing
          },
        };
      }),
    },
  ),
);
