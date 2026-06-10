import { expect, test } from "@playwright/test";

test("guest checkout with fixed waits and brittle selectors", async ({ page }) => {
  await page.goto("/");

  await page.locator(".product-card .add-to-cart").click();
  await page.waitForTimeout(280);

  expect(await page.locator(".cart-count").textContent()).toBe("1");
  expect(await page.locator(".order-total").textContent()).toBe("$129.00");

  await page.locator(".shipping-options button:nth-child(3)").click();
  await page.waitForTimeout(280);

  expect(await page.locator(".order-total").textContent()).toBe("$144.00");

  await page.locator(".place-order").click();
  await page.waitForTimeout(120);
  expect(await page.locator(".status-banner").textContent()).toBe("Order confirmed");
});
