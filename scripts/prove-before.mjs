import { appendFileSync } from "node:fs";

import { persistSummary, runSeries, summarize, toMarkdown } from "./run-series.mjs";

const runs = 10;
const results = runSeries("before", runs);
const summary = summarize("before", runs, results);
const summaryPath = persistSummary("before-ci-summary.txt", summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${toMarkdown(summary)}\n`, "utf8");
}

console.log(`Saved before CI proof to ${summaryPath}`);

if (summary.passCount === 0 || summary.failCount === 0) {
  console.error("Expected the before suite to show both passing and failing runs.");
  process.exit(1);
}
