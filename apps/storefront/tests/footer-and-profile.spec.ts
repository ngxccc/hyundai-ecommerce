import { test, expect } from "@playwright/test";

test.describe("Storefront Footer Visibility & Auth E2E Tests", () => {
  test("Footer should be visible on Homepage, Products, and Cart", async ({ page }) => {
    // 1. Homepage
    await page.goto("/vi");
    await expect(page.locator("footer").first()).toBeVisible();
    await expect(page.locator("footer").first()).toContainText("HYUNDAI NHẬT NĂNG");

    // 2. Catalog Page
    await page.goto("/vi/products");
    await expect(page.locator("footer").first()).toBeVisible();

    // 3. Cart Page
    await page.goto("/vi/cart");
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("Footer should NOT be visible on Auth Pages (Login & Register)", async ({ page }) => {
    // 1. Login Page
    await page.goto("/vi/login");
    await expect(page.locator("footer").first()).not.toBeVisible();

    // 2. Register Page
    await page.goto("/vi/register");
    await expect(page.locator("footer").first()).not.toBeVisible();
  });

  test("Accessing portal page should redirect to login and hide footer", async ({ page }) => {
    // Attempting to visit /vi/portal/profile
    await page.goto("/vi/portal/profile");
    
    // Should be redirected to login page since not authenticated
    await expect(page).toHaveURL(/\/login/);
    
    // Verify footer is not visible
    await expect(page.locator("footer").first()).not.toBeVisible();
  });
});
