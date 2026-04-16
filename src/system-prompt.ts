import { readFileSync } from "node:fs";

const agentsMd = readFileSync("src/agent-md-file.md", "utf-8").trim();
const conventionMd = readFileSync("src/convention-md-file.md", "utf-8").trim();
const systemPrompt = readFileSync("src/system-prompt.md", "utf-8").trim();
const coreCardValues = readFileSync("src/core-card-values.txt", "utf-8").trim();
const issueDetails = readFileSync("src/issue-details.md", "utf-8").trim();
const pullRequestDetails = readFileSync(
  "src/pull-request-details.md",
  "utf-8",
).trim();
const firestoreIndexes = readFileSync(
  "src/firestore-index.json",
  "utf-8",
).trim();
const domainEntities = readFileSync("src/domain-entities.txt", "utf-8").trim();

export const fullSystemPrompt = `
${systemPrompt}

## Repository Context:
### Here is the agent's markdown file that describes the agent's capabilities and how it should use them:
${agentsMd}

### If there are any Firestore queries in the code changes, please refer to the following indexes to understand the data structure and optimize the queries:
${firestoreIndexes}

### Here's the convention's markdown file that describes the coding conventions that the agent should follow when analyzing the code changes:
${conventionMd}

### Core Card Values:
${coreCardValues}

### Here are the domain entities that are relevant to the code changes:
${domainEntities}

### Issue Details:
${issueDetails}

### Pull Request Details:
${pullRequestDetails}
`;
