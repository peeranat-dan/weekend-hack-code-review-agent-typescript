import "@dotenvx/dotenvx/config";
import fs from "node:fs";
import { OpenAI } from "openai";
import { createFileWithContent } from "./utils/write-to-file.ts";
import { fullSystemPrompt as systemPrompt } from "./system-prompt.ts";

const diffContent = fs.readFileSync("src/diff.txt", "utf-8").trim();

const client = new OpenAI({
  baseURL: "https://api.z.ai/api/coding/paas/v4",
  apiKey: process.env.ZAI_API_KEY,
});

const ITERATION = 2;

async function main() {
  console.log("Analyzing PR diff with AI reviewer...");
  console.time("AI Review Time");
  const completion = await client.chat.completions.create({
    model: "glm-5.1",
    reasoning_effort: "high",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: diffContent,
      },
    ],
  });

  console.timeEnd("AI Review Time");

  for (const choice of completion.choices) {
    const reasoning = (choice.message as any)?.reasoning_content;
    if (reasoning) {
      console.log("Thinking:");
      console.log("=========");
      console.log(reasoning);
      console.log("=========");
      console.log();
    }

    console.log("Review Summary:");
    console.log("===============");
    console.log(choice.message?.content);
    console.log("===============");
    console.log("End of Review Summary");

    console.log("\nFull API Response:");
    console.log(JSON.stringify(completion, null, 2));

    // dump the system prompt into a file for later analysis
    createFileWithContent(
      `outputs/iteration-${ITERATION}/system-prompt.md`,
      systemPrompt,
    );

    // dump the reasoning and the final answer into a file for later analysis
    createFileWithContent(
      `outputs/iteration-${ITERATION}/review-summary.md`,
      choice.message?.content ?? "",
    );

    if (reasoning) {
      createFileWithContent(
        `outputs/iteration-${ITERATION}/reasoning.md`,
        reasoning,
      );
    }

    // dump token usage into a file for later analysis
    const usage = completion.usage;
    createFileWithContent(
      `outputs/iteration-${ITERATION}/token-usage.json`,
      JSON.stringify(usage, null, 2),
    );
  }
}

await main();
