import { test, expect } from "@playwright/test";

test.describe("Hyundai B2B Storefront UI Full Audit", () => {
  test("Homepage UI Verification", async ({ page, isMobile }) => {
    await page.goto("/vi");

    // 1. Check title
    await expect(page).toHaveTitle(/Hyundai/i);

    // 2. Verify header navigation links
    if (isMobile) {
      const menuToggle = page.locator("button[aria-label='Toggle mobile menu']").first();
      await expect(menuToggle).toBeVisible();
    } else {
      const productsLink = page.locator("a:has-text('Sản phẩm')").first();
      const solutionsLink = page.locator("a:has-text('Giải pháp')").first();
      const servicesLink = page.locator("a:has-text('Dịch vụ')").first();
      await expect(productsLink).toBeVisible();
      await expect(solutionsLink).toBeVisible();
      await expect(servicesLink).toBeVisible();
    }

    // 3. Verify footer content
    const footerText = page.locator("footer").first();
    await expect(footerText).toContainText("HYUNDAI NHẬT NĂNG");
  });

  test("Catalog Page & Quote-Only Rules", async ({ page }) => {
    await page.goto("/vi/products");

    // 1. Check page header
    await expect(page.locator("h1").first()).toContainText("Danh mục sản phẩm");

    // 2. Check quote-only product (e.g. HY-30CLE) does not show Add to Cart but shows Request Quote
    const quoteProductCard = page.locator(".group:has-text('HY-30CLE')").first();
    if (await quoteProductCard.count() > 0) {
      const addToCartBtn = quoteProductCard.locator("button:has-text('Thêm vào giỏ')");
      const requestQuoteBtn = quoteProductCard.locator("a:has-text('Yêu cầu báo giá')");
      await expect(addToCartBtn).not.toBeVisible();
      await expect(requestQuoteBtn).toBeVisible();
    }
  });

  test("Shopping Cart E2E Flow (Full Case)", async ({ page }) => {
    // 1. Go to Products catalog
    await page.goto("/vi/products");

    // 2. Find a product that can be added to cart (e.g., Kubota GL-6500)
    const kubotaCard = page.locator("div:has-text('Kubota GL-6500')").first();
    await expect(kubotaCard).toBeVisible();

    const addToCartBtn = kubotaCard.locator("button:has-text('Thêm vào giỏ')").first();
    await expect(addToCartBtn).toBeVisible();

    // 3. Click Add to Cart
    await addToCartBtn.click();

    // 4. Verify toast notification appears or cart count updates
    const cartBadge = page.locator("a[href*='/cart'] [data-slot='badge']:visible").first();
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText("1");

    // 5. Navigate to Cart page
    await page.goto("/vi/cart");

    // 6. Check that product is in the cart
    await expect(page.locator("h1").first()).toContainText("Giỏ hàng");
    const cartItemRow = page.locator("div:has-text('Kubota GL-6500')").first();
    await expect(cartItemRow).toBeVisible();

    // 7. Verify quantity input is present and has no 'font-mono' class
    const qtyInput = page.locator("input[type='number']").first();
    await expect(qtyInput).toBeVisible();
    await expect(qtyInput).toHaveValue("1");
    await expect(qtyInput).not.toHaveClass(/font-mono/);

    // 8. Modify quantity manually to 2
    await qtyInput.fill("2");
    await qtyInput.blur();
    await expect(qtyInput).toHaveValue("2");

    // 9. Verify sticky bottom summary bar (mobile) or summary card (desktop) updates pricing
    const desktopSummary = page.locator(".hidden.lg\\:block:has-text('Tóm tắt đơn hàng')");
    if (await desktopSummary.isVisible()) {
      await expect(desktopSummary).toContainText("VAT (10%)");
    }

    // 10. Remove item from cart using the delete button
    const deleteBtn = page.locator("button[aria-label='Xóa sản phẩm']").first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    } else {
      // fallback if different label is used, find by text/icon
      const removeBtn = page.locator("button:has(svg.lucide-trash), button:has-text('Xóa')").first();
      await removeBtn.click();
    }

    // 11. Verify cart is empty now
    const emptyStateText = page.locator("text=Giỏ hàng trống").first();
    await expect(emptyStateText).toBeVisible();
  });

  test("Mobile Navigation Menu Interactions", async ({ page, isMobile }) => {
    await page.goto("/vi");

    if (isMobile) {
      // 1. Verify burger toggle menu button is visible on mobile
      const menuToggle = page.locator("button[aria-label='Toggle mobile menu']").first();
      await expect(menuToggle).toBeVisible();

      // 2. Open mobile menu
      await menuToggle.click();

      // 3. Verify sheet drawer opened
      const sheetContent = page.locator("[data-slot='sheet-content']").first();
      await expect(sheetContent).toBeVisible();

      // 4. Click 'Sản phẩm' navigation link
      const productsLink = sheetContent.locator("a:has-text('Sản phẩm')").first();
      await productsLink.click();

      // 5. Verify URL has changed and mobile menu sheet is closed
      await expect(page).toHaveURL(/\/products/);
      await expect(sheetContent).not.toBeVisible();

      // 6. Test same-page link click to ensure it closes without reloading/blinking
      await menuToggle.click();
      await expect(sheetContent).toBeVisible();
      await productsLink.click();
      await expect(sheetContent).not.toBeVisible();
      await expect(page).toHaveURL(/\/products/);
    } else {
      // On desktop, the mobile menu toggle must be hidden
      const menuToggle = page.locator("button[aria-label='Toggle mobile menu']").first();
      await expect(menuToggle).not.toBeVisible();
    }
  });
});
