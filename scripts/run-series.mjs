import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = path.join(rootDir, "artifacts");
const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

function percentile50(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function formatSeconds(milliseconds) {
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

export function summarize(project, runs, results) {
  const passCount = results.filter((result) => result.passed).length;
  const failCount = results.length - passCount;
  const durations = results.map((result) => result.durationMs);
  const firstFailureIndex = results.findIndex((result) => !result.passed);
  const longestGreenStreak = results.reduce(
    (summary, result) => {
      if (!result.passed) {
        return { current: 0, longest: summary.longest };
      }

      const current = summary.current + 1;
      return {
        current,
        longest: Math.max(summary.longest, current),
      };
    },
    { current: 0, longest: 0 },
  ).longest;

  return {
    project,
    runs,
    passCount,
    failCount,
    passRate: passCount / runs,
    medianDurationMs: percentile50(durations),
    longestGreenStreak,
    timeToFirstFailureMs:
      firstFailureIndex === -1
        ? null
        : results
            .slice(0, firstFailureIndex + 1)
            .reduce((total, result) => total + result.durationMs, 0),
  };
}

export function toMarkdown(summary) {
  return [
    `### ${summary.project} proof`,
    "",
    `- Runs: ${summary.runs}`,
    `- Passes: ${summary.passCount}`,
    `- Failures: ${summary.failCount}`,
    `- Pass rate: ${(summary.passRate * 100).toFixed(1)}%`,
    `- Longest green streak: ${summary.longestGreenStreak}`,
    `- Median run time: ${formatSeconds(summary.medianDurationMs)}`,
    `- Time to first failure: ${
      summary.timeToFirstFailureMs === null ? "not observed" : formatSeconds(summary.timeToFirstFailureMs)
    }`,
    "",
  ].join("\n");
}

export function persistSummary(filename, summary) {
  mkdirSync(artifactsDir, { recursive: true });
  const fullPath = path.join(artifactsDir, filename);
  writeFileSync(fullPath, `${toMarkdown(summary)}\n${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return fullPath;
}

export function runSeries(project, runs) {
  const results = [];

  for (let run = 1; run <= runs; run += 1) {
    const startedAt = performance.now();
    const execution = spawnSync(npxBin, ["playwright", "test", "--project", project, "--reporter=line"], {
      cwd: rootDir,
      encoding: "utf8",
      env: { ...process.env },
      maxBuffer: 1024 * 1024 * 10,
    });
    const durationMs = performance.now() - startedAt;
    const passed = execution.status === 0;

    results.push({
      run,
      passed,
      durationMs,
      exitCode: execution.status ?? 1,
      outputTail: `${execution.stdout || ""}${execution.stderr || ""}`
        .trim()
        .split("\n")
        .slice(-10),
    });

    console.log(`[${project}] run ${run}/${runs}: ${passed ? "PASS" : "FAIL"} (${formatSeconds(durationMs)})`);
  }

  return results;
}
