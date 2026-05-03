import { OpenAI } from "openai";
import { fullSystemPrompt as systemPrompt } from "./system-prompt.js";
import "@dotenvx/dotenvx/config";

const client = new OpenAI({
  baseURL: "https://api.z.ai/api/coding/paas/v4",
  apiKey: process.env.ZAI_API_KEY,
});

export async function callAIReviewer(diff: string): Promise<string[]> {
  const completion = await client.chat.completions.create({
    model: "glm-5.1",
    reasoning_effort: "high",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: diff },
    ],
  });
  const content = completion.choices[0]?.message?.content ?? "";
  const match = content.match(/ISSUES_JSON:\s*(\[.*\])/s);
  if (!match) return [];
  return JSON.parse(match[1]) as string[];
}
