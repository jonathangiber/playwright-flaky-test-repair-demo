import { appendFileSync } from "node:fs";

import { persistSummary, runSeries, summarize, toMarkdown } from "./run-series.mjs";

const runs = 10;
const results = runSeries("after", runs);
const summary = summarize("after", runs, results);
const summaryPath = persistSummary("after-ci-summary.txt", summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${toMarkdown(summary)}\n`, "utf8");
}

console.log(`Saved after CI proof to ${summaryPath}`);

if (summary.failCount > 0) {
  console.error("Expected the after suite to stay green in repeated CI runs.");
  process.exit(1);
}
