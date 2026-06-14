require("../../../products/components/__tests__/setup-dom");

import { describe, it, expect, vi } from "vitest";
const { render, screen } = require("@testing-library/react");
const { CartTemplate } = require("../cart-template");
const { NextIntlClientProvider } = require("next-intl");

const messages = {
  Cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    summary: "Order Summary",
    checkout: "Proceed to Checkout",
    quote: "Request Quote"
  }
};

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

  it("renders empty cart state successfully", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CartTemplate />
      </NextIntlClientProvider>
    );
    expect(await screen.findByText("Your cart is empty")).toBeDefined();
  });
