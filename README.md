# code-review-ai

A proof-of-concept CLI tool that automates senior-level code reviews using an AI model with extended reasoning. Feed it a git diff plus context files describing your codebase, and it produces a structured review covering risk areas, file roles, system impact, and suggested reviewer focus.

## How it works

1. You provide a git diff (`src/diff.txt`) and optional context files (business logic, coding conventions, domain models, issue/PR details)
2. The tool assembles a system prompt from all context files and sends it to the AI API
3. The model reasons deeply before producing a structured review
4. All outputs (review, reasoning, token usage, timing) are saved to a timestamped iteration folder under `outputs/`

## Prerequisites

- Node.js LTS
- pnpm (`npm install -g pnpm`)
- A `ZAI_API_KEY` for the z.ai API (ask the project owner for `.env.keys`)

## Setup

```bash
pnpm install
```

Place the `.env.keys` file in the project root (not committed), then decrypt the environment file:

```bash
pnpm env:decrypt
```

## Usage

### 1. Add your diff

```bash
git diff main...your-branch > src/diff.txt
```

### 2. (Optional) Update context files

| File                          | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `src/issue-details.md`        | Ticket requirements / acceptance criteria      |
| `src/pull-request-details.md` | PR description                                 |
| `src/agent-md-file.md`        | Business logic and domain rules                |
| `src/convention-md-file.md`   | Architecture and coding conventions            |
| `src/domain-entities.txt`     | Data model reference                           |
| `src/firestore-index.json`    | Database index schema                          |
| `src/core-card-values.txt`    | Team values / principles                       |
| `src/system-prompt.md`        | Base review instructions (edit to tune output) |

The more context you provide, the more accurate and project-aware the review will be.

### 3. Run the reviewer

```bash
pnpm start
```

### 4. Check the output

Results are written to `outputs/iteration-N/` where N increments on each run:

| File                     | Contents                               |
| ------------------------ | -------------------------------------- |
| `review-summary.md`      | Structured AI code review              |
| `reasoning.md`           | The model's internal analysis/thinking |
| `system-prompt.md`       | Full system prompt that was sent       |
| `token-usage.json`       | API token consumption                  |
| `time-taken.txt`         | Wall-clock execution time (ms)         |
| `full-api-response.json` | Raw API response                       |

## Project structure

```
src/
├── index.ts               # Entry point — orchestrates the review run
├── system-prompt.ts       # Assembles system prompt from context files
├── diff.txt               # Input: git diff to review
├── system-prompt.md       # Base instructions for the AI reviewer
├── agent-md-file.md       # Business logic context
├── convention-md-file.md  # Coding conventions
├── issue-details.md       # Ticket/issue context
├── pull-request-details.md
├── domain-entities.txt
├── firestore-index.json
├── core-card-values.txt
└── utils/
    └── write-to-file.ts   # Output file helper
outputs/                   # Generated reviews (gitignored)
```

## Configuration

All tunable settings live in the context files under `src/`. To change the review format or instructions, edit `src/system-prompt.md`. The model, API base URL, and reasoning effort are set in `src/index.ts`.

| Setting          | Value                                        |
| ---------------- | -------------------------------------------- |
| API              | z.ai (`https://api.z.ai/api/coding/paas/v4`) |
| Model            | `glm-5.1`                                    |
| Reasoning effort | `high`                                       |
