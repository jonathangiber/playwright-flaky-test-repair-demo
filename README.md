# A real before/after of a flaky Playwright suite - random failures diagnosed and made reliable, with CI proof.

[![CI](https://github.com/jonathangiber/playwright-flaky-test-repair-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathangiber/playwright-flaky-test-repair-demo/actions/workflows/ci.yml)

This repo shows a small checkout flow with real UI jitter and two Playwright suites against it. The `before/` suite uses fixed sleeps, brittle selectors, and no failure artifacts. The `after/` suite stabilizes the same flow with state-based waits, stable selectors, retries in CI, and traces on retry.

Flaky browser tests cost teams twice: they waste time on false alarms, and they make real failures harder to trust. The point of this repo is not to talk about that problem abstractly. It is to make the behavior public and reproducible.

## Before/After

Measured locally on `2026-06-10` with 20 full runs per suite.

| Suite | 20-run pass rate | Longest green streak | Median run time | Time to first failure |
| --- | --- | --- | --- | --- |
| `before/checkout.spec.ts` | `13 / 20` (65.0%) | `4` | `1.92s` | `1.79s` |
| `after/checkout.spec.ts` | `20 / 20` (100.0%) | `20` | `1.89s` | not observed across the 20-run sample |

Diagnosis signal matters too: the `before` project has no trace configured, while the `after` project keeps Playwright traces on the first CI retry so a future failure comes with a reproducible artifact.

The CI workflow stays green by proving both sides:

- `prove-before` repeats the flaky suite and fails the workflow unless it observes both passing and failing runs.
- `prove-after` repeats the stabilized suite and fails the workflow if any run flakes.

## Fix patterns

1. Replace fixed sleeps with state-based assertions.

```ts
await expect(page.getByTestId("cart-count")).toHaveText("1");
```

2. Replace CSS-structure selectors with stable contracts.

```ts
await page.getByTestId("shipping-express").click();
```

3. Wait for the next business state before taking the next action.

```ts
await expect(page.getByTestId("order-status")).toHaveText("Shipping updated");
```

4. Keep retries and traces where they help diagnosis, not where they hide a bad test.

```ts
retries: process.env.CI ? 2 : 0
```

## Run it yourself

```bash
git clone https://github.com/jonathangiber/playwright-flaky-test-repair-demo.git
cd playwright-flaky-test-repair-demo
npm install
npx playwright install chromium
npm run test:before
npm run test:after
npm run measure
```

## Repo layout

```text
before/   intentionally flaky suite
after/    stabilized suite
docs/     root cause and fix writeups
app/      tiny local checkout app under test
scripts/  measurement and CI proof helpers
```

Built by Jonathan Giber - QA & Browser Automation. Hire me on Upwork: https://www.upwork.com/freelancers/~013d25f44866e0a870
