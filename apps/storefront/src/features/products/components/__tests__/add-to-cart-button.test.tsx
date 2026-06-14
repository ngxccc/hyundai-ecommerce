import "./setup-dom";

import { describe, it, expect, vi } from "vitest";
const { render, screen } = require("@testing-library/react");
const { AddToCartButton } = require("../add-to-cart-button");

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("@/features/cart", () => ({
  useCartStore: () => ({
    items: [],
    addItem: vi.fn()
  })
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe("AddToCartButton", () => {
  it("renders successfully", () => {
    render(
      <AddToCartButton
        productId="prod-1"
        name="Generator"
        price="1000"
        image="/gen.jpg"
        totalStock={10}
      />
    );
    expect(screen.getByText("addToCart")).toBeDefined();
  });
});
