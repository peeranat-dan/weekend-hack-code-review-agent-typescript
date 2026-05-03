import { createScorer, evalite } from "evalite";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { gtIteration4 } from "./gt-iteration-4.js";
import { readFileSync } from "node:fs";
import { callAIReviewer } from "../reviewer.js";

const diffContent = readFileSync("src/diff.txt", "utf-8").trim();

// const EVALS_MODEL = "openai/gpt-oss-120b:free";
const EVALS_MODEL = "kimi-k2.6";

const client = new OpenAI({
  baseURL: "https://api.moonshot.ai/v1",
  apiKey: process.env.MOONSHOT_API_KEY,
});

const IssueResultSchema = z.object({
  results: z.array(
    z.object({
      issue: z.string(),
      caught: z.boolean(),
      rationale: z.string(),
    }),
  ),
});

const FalsePositiveResultSchema = z.object({
  results: z.array(
    z.object({
      issue: z.string(),
      is_false_positive: z.boolean(),
      rationale: z.string(),
    }),
  ),
});

const expectedIssues = gtIteration4
  .map((e) => `${e.category}/${e.severity} - ${e.issue}`)
  .join("\n");

const checkIssueCoverage = async ({
  output,
  expected,
}: {
  output: string[];
  expected: string;
}) => {
  const response = await client.chat.completions.parse({
    model: EVALS_MODEL,
    reasoning_effort: "high",
    messages: [
      {
        role: "system",
        content: `You are evaluating an AI code review output against a list of expected issues.
For each expected issue, decide whether the AI review mentioned or implied it.
Be lenient — if the AI described the problem without naming it exactly, count it as caught.
ensure all JSON string values are properly escaped and do not contain literal newlines or tabs.

Respond with a JSON object matching this schema:
{
  "results": [
    {
      "issue": "<the expected issue text>",
      "caught": true | false,
      "rationale": "<one sentence explaining your decision>"
    }
  ]
}

Return one entry per expected issue, in the same order as the input list.`,
      },
      {
        role: "user",
        content: `[EXPECTED ISSUES]\n${expected}\n\n[AI REVIEW OUTPUT]\n${output.join("\n")}`,
      },
    ],
    response_format: zodResponseFormat(IssueResultSchema, "issue_coverage"),
  });

  if (response.choices[0]?.message.refusal) {
    throw new Error(
      `Model refused to evaluate issue coverage: ${response.choices[0].message.refusal}`,
    ); // Handle refusal case
  }

  const object = response.choices[0]?.message?.parsed;
  if (!object) throw new Error("No parsed object in checkIssueCoverage");

  const caught = object.results.filter((r) => r.caught).length;
  const total = gtIteration4.length;

  return {
    score: caught / total,
    metadata: {
      caught,
      total,
      breakdown: object.results,
    },
  };
};

const checkFalsePositiveRate = async ({
  output,
  expected,
}: {
  output: string[];
  expected: string;
}) => {
  if (output.length === 0) {
    return {
      score: 0,
      metadata: { false_positives: 0, total: 0, breakdown: [] },
    };
  }

  const response = await client.chat.completions.parse({
    model: EVALS_MODEL,
    reasoning_effort: "high",
    messages: [
      {
        role: "system",
        content: `You are auditing an AI code review for false positives.
For each issue raised by the AI, decide whether it is a false positive — i.e., it is NOT in the list of known real issues and is not a reasonable variant of any of them.
ensure all JSON string values are properly escaped and do not contain literal newlines or tabs.

Respond with a JSON object matching this schema:
{
  "results": [
    {
      "issue": "<the AI-raised issue>",
      "is_false_positive": true | false,
      "rationale": "<one sentence explaining your decision>"
    }
  ]
}

Return one entry per AI-raised issue, in the same order as the input list.`,
      },
      {
        role: "user",
        content: [
          "[KNOWN REAL ISSUES]",
          expected,
          "",
          "[AI-RAISED ISSUES]",
          output.map((s, i) => `${i + 1}. ${s}`).join("\n"),
        ].join("\n"),
      },
    ],
    response_format: zodResponseFormat(
      FalsePositiveResultSchema,
      "false_positive_check",
    ),
  });

  if (response.choices[0]?.message.refusal) {
    throw new Error(
      `Model refused to evaluate false positive rate: ${response.choices[0].message.refusal}`,
    ); // Handle refusal case
  }

  const object = response.choices[0]?.message?.parsed;
  if (!object) throw new Error("No parsed object in checkFalsePositiveRate");

  const falsePositives = object.results.filter(
    (r) => r.is_false_positive,
  ).length;
  const total = output.length;

  return {
    score: falsePositives / total,
    metadata: {
      false_positives: falsePositives,
      total,
      breakdown: object.results,
    },
  };
};

export const IssueCoverage = createScorer<string, string[], string>({
  name: "Issue Coverage",
  scorer: ({ output, expected }) =>
    checkIssueCoverage({ output, expected: expected! }),
});

export const FalsePositiveRate = createScorer<string, string[], string>({
  name: "False Positive Rate",
  scorer: ({ output, expected }) =>
    checkFalsePositiveRate({ output, expected: expected! }),
});

evalite("Code Review Quality2", {
  data: [
    {
      input: diffContent,
      expected: expectedIssues,
    },
  ],
  task: async (input): Promise<string[]> => {
    return callAIReviewer(input);
  },
  scorers: [IssueCoverage, FalsePositiveRate],
});
