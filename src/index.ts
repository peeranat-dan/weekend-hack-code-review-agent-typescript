import "@dotenvx/dotenvx/config";
import fs from "node:fs";
import { createFileWithContent } from "./utils/write-to-file.ts";
import { callAIReviewer } from "./reviewer.ts";

const diffContent = fs.readFileSync("src/diff.txt", "utf-8").trim();

const ITERATION = 4;

async function main() {
  console.log("Analyzing PR diff with AI reviewer...");
  console.time("AI Review Time");
  const t0 = performance.now();

  const content = await callAIReviewer(diffContent);

  console.timeEnd("AI Review Time");
  const t1 = performance.now();

  console.log("Review Summary:");
  console.log("===============");
  console.log(content);
  console.log("===============");
  console.log("End of Review Summary");

  createFileWithContent(
    `outputs/iteration-${ITERATION}/review-summary.md`,
    content.join("\n"),
  );

  const timeTaken = t1 - t0;
  createFileWithContent(
    `outputs/iteration-${ITERATION}/time-taken.txt`,
    `${timeTaken} ms`,
  );
}

await main();
