/* eslint-disable */

require("../../../products/components/__tests__/setup-dom");

import { describe, it, expect, vi } from "vitest";
const { render, screen } = require("@testing-library/react");
const { CartTemplate } = require("../cart-template");

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("@/features/cart", () => ({
  useCart: (selector: any) => {
    const state = {
      items: []
    };
    return selector(state);
  },
  useCartStore: () => ({
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn()
  })
}));

describe("CartTemplate", () => {
  it("renders empty cart state successfully", async () => {
    render(
      <CartTemplate />
    );
    expect(await screen.findByText("empty")).toBeDefined();
  });
});
