# What Was Wrong

The `before/checkout.spec.ts` file is intentionally written the way flaky tests often show up in real teams: the flow looks straightforward, but the test assumes the UI is ready before the browser has any proof that it is.

## Root causes

1. Fixed sleeps raced the application state.

```ts
await page.waitForTimeout(220);
```

The demo app updates cart state and shipping totals after a random async delay. Sometimes `220ms` is long enough. Sometimes it is not.

2. The selector strategy depended on CSS structure instead of a stable contract.

```ts
await page.locator(".shipping-options button:nth-child(3)").click();
```

That selector works only because the current button order happens to match the assumption. It is easy to break during a routine UI refactor.

3. The test clicked the shipping control before the cart was actually ready.

The app ignores shipping clicks until the cart update finishes. When the fixed sleep ends too early, the click is accepted by the browser but ignored by the app logic.

4. Failures had no built-in debugging artifact.

The `before` project disables traces, so a failing run produces only the assertion error. Reproducing the failure is easy, but diagnosing the exact UI state is slower than it needs to be.

## What that means in practice

- The same command can pass once and fail on the next run.
- A green result does not prove the test is healthy.
- A failure does not tell you enough about the page state to debug quickly.
