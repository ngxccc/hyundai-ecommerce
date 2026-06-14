require("../../../products/components/__tests__/setup-dom");

import { describe, it, expect, vi } from "vitest";
const { render, screen } = require("@testing-library/react");
const { HeaderCart } = require("../header-cart");
const { NextIntlClientProvider } = require("next-intl");

const messages = {
  Cart: {
    empty: "Your cart is empty",
    viewCart: "View Full Cart"
  }
};

vi.mock("@/features/cart", () => ({
  useCart: (selector: any) => {
    const state = {
      items: [],
      isOpen: false
    };
    return selector(state);
  }
}));

describe("HeaderCart", () => {
  it("renders loading skeleton before mount", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HeaderCart />
      </NextIntlClientProvider>
    );
    expect(screen.getByTestId("cart-skeleton")).toBeDefined();
  });
});
