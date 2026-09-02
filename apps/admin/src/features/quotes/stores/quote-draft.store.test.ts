import { expect, test, describe, beforeEach } from "bun:test";
import { useQuoteDraftStore } from "./quote-draft.store";
import type { ProductDTO } from "@nhatnang/database/dtos";

const mockProduct: ProductDTO = {
  id: "prod-100",
  nameVi: "Máy phát điện Hyundai DHY6000SE",
  nameEn: null,
  slug: "hyundai-dhy6000se",
  price: "28000000.00",
  descriptionVi: null,
  descriptionEn: null,
  shortDescriptionVi: null,
  shortDescriptionEn: null,
  images: ["https://res.cloudinary.com/demo/image/upload/dhy6000se.jpg"],
  brandId: "brand-1",
  categoryId: "cat-1",
  specs: {
    model: "DHY6000SE",
    power: 5.5,
    phase: "1phase",
    fuelType: "diesel",
  },
  totalStockCache: 5,
  isQuoteOnly: false,
};

describe("QuoteDraftStore", () => {
  beforeEach(() => {
    useQuoteDraftStore.getState().resetDraft();
  });

  describe("addProduct()", () => {
    describe("when adding a new catalog product", () => {
      test("should add product as a draft line item with extracted specs and price", () => {
        useQuoteDraftStore.getState().addProduct(mockProduct, 2);

        const items = useQuoteDraftStore.getState().items;
        expect(items).toHaveLength(1);
        expect(items[0]!.productId).toBe("prod-100");
        expect(items[0]!.itemName).toBe("Máy phát điện Hyundai DHY6000SE");
        expect(items[0]!.itemSpecs).toBe("5.5kVA, 1 Pha, diesel");
        expect(items[0]!.quantity).toBe(2);
        expect(items[0]!.unitPrice).toBe(28000000);
        expect(items[0]!.discountPercent).toBe(0);
      });
    });

    describe("when adding an existing product again", () => {
      test("should increment quantity on the existing line item instead of duplicating", () => {
        useQuoteDraftStore.getState().addProduct(mockProduct, 1);
        useQuoteDraftStore.getState().addProduct(mockProduct, 3);

        const items = useQuoteDraftStore.getState().items;
        expect(items).toHaveLength(1);
        expect(items[0]!.quantity).toBe(4);
      });
    });
  });

  describe("addCustomItem()", () => {
    describe("when adding an ad-hoc custom line item", () => {
      test("should insert custom item with null productId and isCustomItem true", () => {
        useQuoteDraftStore.getState().addCustomItem({
          itemName: "Nhân công lắp đặt & căn chỉnh tận nơi",
          itemModel: "LABOR-INST",
          itemSpecs: "Lắp đặt kỹ thuật tại công trình Hà Nội",
          unitPrice: 2500000,
          quantity: 1,
          discountPercent: 10,
        });

        const items = useQuoteDraftStore.getState().items;
        expect(items).toHaveLength(1);
        expect(items[0]!.productId).toBeNull();
        expect(items[0]!.isCustomItem).toBe(true);
        expect(items[0]!.itemName).toBe("Nhân công lắp đặt & căn chỉnh tận nơi");
        expect(items[0]!.unitPrice).toBe(2500000);
        expect(items[0]!.discountPercent).toBe(10);
      });
    });
  });

  describe("updateItem() and removeItem()", () => {
    describe("when updating discount percent and quantity", () => {
      test("should mutate specified draft item properties", () => {
        useQuoteDraftStore.getState().addProduct(mockProduct, 1);
        const itemId = useQuoteDraftStore.getState().items[0]!.id;

        useQuoteDraftStore.getState().updateItem(itemId, {
          discountPercent: 5,
          quantity: 3,
        });

        const updated = useQuoteDraftStore.getState().items[0]!;
        expect(updated.discountPercent).toBe(5);
        expect(updated.quantity).toBe(3);
      });
    });

    describe("when removing an item by id", () => {
      test("should filter out item from draft list", () => {
        useQuoteDraftStore.getState().addProduct(mockProduct, 1);
        const itemId = useQuoteDraftStore.getState().items[0]!.id;

        useQuoteDraftStore.getState().removeItem(itemId);
        expect(useQuoteDraftStore.getState().items).toHaveLength(0);
      });
    });
  });

  describe("customerInfo and commercialTerms", () => {
    describe("when updating customer form info", () => {
      test("should merge customer data into draft state", () => {
        useQuoteDraftStore.getState().setCustomerInfo({
          customerName: "Công ty TNHH Cơ điện Alpha",
          customerPhone: "0912345678",
          companyName: "Alpha M&E",
        });

        const customer = useQuoteDraftStore.getState().customerInfo;
        expect(customer.customerName).toBe("Công ty TNHH Cơ điện Alpha");
        expect(customer.customerPhone).toBe("0912345678");
        expect(customer.companyName).toBe("Alpha M&E");
      });
    });

    describe("when resetting draft", () => {
      test("should clear items and restore default terms and customer info", () => {
        useQuoteDraftStore.getState().addProduct(mockProduct, 1);
        useQuoteDraftStore.getState().setCustomerInfo({ customerName: "Test" });

        useQuoteDraftStore.getState().resetDraft();

        expect(useQuoteDraftStore.getState().items).toHaveLength(0);
        expect(useQuoteDraftStore.getState().customerInfo.customerName).toBe("");
      });
    });
  });
});
