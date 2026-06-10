import { expect, test } from "@playwright/test";

test("guest checkout with stable selectors and state-based waits", async ({ page }) => {
  await page.goto("/");

  await test.step("Add the item and wait for the cart state", async () => {
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await expect(page.getByTestId("order-total")).toHaveText("$129.00");
    await expect(page.getByTestId("order-status")).toHaveText("Ready for shipping");
  });

  await test.step("Choose express shipping after the UI is ready", async () => {
    await page.getByTestId("shipping-express").click();
    await expect(page.getByTestId("order-total")).toHaveText("$144.00");
    await expect(page.getByTestId("order-status")).toHaveText("Shipping updated");
  });

  await test.step("Place the order and wait for the confirmation state", async () => {
    await page.getByTestId("place-order").click();
    await expect(page.getByTestId("order-status")).toHaveText("Order confirmed");
  });
});
