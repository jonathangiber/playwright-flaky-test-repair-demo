# How It Was Fixed

The `after/checkout.spec.ts` file keeps the same user journey but replaces assumptions with observable state.

## Fix patterns

1. Wait for business state, not elapsed time.

```ts
await expect(page.getByTestId("cart-count")).toHaveText("1");
await expect(page.getByTestId("order-status")).toHaveText("Ready for shipping");
```

2. Use stable selectors that survive layout changes.

```ts
await page.getByTestId("shipping-express").click();
```

3. Assert each critical transition before moving on.

```ts
await expect(page.getByTestId("order-total")).toHaveText("$144.00");
```

4. Capture traces automatically when a retry is needed in CI.

```ts
{
  name: "after",
  retries: process.env.CI ? 2 : 0,
  use: { trace: process.env.CI ? "on-first-retry" : "retain-on-failure" },
}
```

5. Keep the proof public.

The CI workflow does two things:

- repeats the `before` suite until it proves the suite is genuinely flaky by observing both passes and failures
- repeats the `after` suite until it proves the stabilized version stays green
