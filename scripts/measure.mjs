import { persistSummary, runSeries, summarize } from "./run-series.mjs";

function parseArgs(argv) {
  const config = { project: "", runs: 20 };

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--project") {
      config.project = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--runs") {
      config.runs = Number(argv[index + 1]);
      index += 1;
    }
  }

  if (!config.project) {
    throw new Error("Missing required --project argument");
  }

  return config;
}

const config = parseArgs(process.argv.slice(2));
const results = runSeries(config.project, config.runs);
const summary = summarize(config.project, config.runs, results);
const summaryPath = persistSummary(`${config.project}-measurement.txt`, summary);

console.log("");
console.log(`Saved ${config.project} measurement summary to ${summaryPath}`);
console.log(JSON.stringify(summary, null, 2));
