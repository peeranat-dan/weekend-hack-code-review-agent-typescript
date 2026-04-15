import { readFileSync } from "node:fs";

const agentsMd = readFileSync("src/agent-md-file.md", "utf-8").trim();
const conventionMd = readFileSync("src/convention-md-file.md", "utf-8").trim();
const systemPrompt = readFileSync("src/system-prompt.md", "utf-8").trim();
const coreCardValues = readFileSync("src/core-card-values.txt", "utf-8").trim();

export const fullSystemPrompt = `
${systemPrompt}

## Repository Context:
### Here is the agent's markdown file that describes the agent's capabilities and how it should use them:
${agentsMd}

### Here's the convention's markdown file that describes the coding conventions that the agent should follow when analyzing the code changes:
${conventionMd}

### Core Card Values:
${coreCardValues}
`;
