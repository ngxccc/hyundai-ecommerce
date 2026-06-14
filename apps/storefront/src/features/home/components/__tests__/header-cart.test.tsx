/* eslint-disable */

require("../../../products/components/__tests__/setup-dom");

import { describe, it, expect, vi } from "vitest";
const { render, screen } = require("@testing-library/react");
const { HeaderCart } = require("../header-cart");

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

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
        <HeaderCart />
    );
    expect(screen.getByTestId("cart-skeleton")).toBeDefined();
  });
});
