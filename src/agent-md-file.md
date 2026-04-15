## Core Business Logic

**Session**

- A session has a `name`, a `votingSystem` (e.g. fibonacci, t-shirt), an `ownerId`, and a status of `active` or `finished`.
- A session is created by an owner and stays `active` until terminated, at which point it becomes `finished` and is immutable.
- The voting system of a session may only be changed when it actually differs from the current value.

**Participants & Roles**

- Roles: `owner`, `admin`, `player`, `spectator`. Statuses: `active`, `left`, `removed`.
- `owner` and `admin` can manage the session (start/reveal rounds, remove participants, export, terminate).
- `player` can vote; `spectator` cannot vote but can observe.
- A participant can vote only when their status is `active` and role is not `spectator`.
- A participant can leave only while `active` and the session is not `finished`.
- A participant can rejoin only if they previously `left` and the session is still `active`.
- A participant can be removed only while `active`.

**Rounds**

- Each session runs a sequence of rounds. A round is `in-progress` until revealed, then `revealed`, finally `finished`.
- Votes may only be cast or updated while the round is `in-progress`.
- A vote update is only valid if the vote belongs to the current round.
- Only managers (owner/admin) can reveal a round, exposing all submitted votes.
- A new round may only be started once the latest round is `finished`.
- A revealed round may be re-voted (reopened) by a owner, returning it to `in-progress`.

**Voting**

- Each active player casts one vote per round; re-casting before reveal replaces the previous value.
- Spectators and non-active participants are blocked from voting at the domain level.
- Results (average, distribution) are computed from the votes of the revealed round.

**Access Control**

- Session lifecycle actions (terminate, update info, export votes) require owner role.
- All mutating actions assert the session exists and is not `finished` before proceeding.

# Package Manager

pnpm@9.14.2

# Bash Command

pnpm install: install dependencies
pnpm dev: start development server
pnpm build: build production version
pnpm lint: lint code
pnpm test: run unit tests
pnpm format: format code

# Development Workflow

- After running claude code, try running pnpm run build, pnpm run lint, and pnpm test.

# Code Architecture

Refering to the code architecture document in the CONTRIBUTING.md file

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Use kebab-case for file names
- Create index.ts file with export \* from './file' for each directory
- Use single quotes for strings
- Use const for variables that don't need to be re-assigned
- Don't use enum, use const objects with 'as const' or union string instead
- Use nullish coalescing operator (??) over logical or (||) for default values
- Use template literals for multi-line strings
- Use function declarations for top level functions and arrow functions for everything else
- When declaring a component, please use object declaration instead of switch statement
- Add unit tests for all hooks and components
- Add e2e tests for all flows
- When adding new features, add in README.md
- When implementing new components, data layer function, or domain services, please add JSDoc comments

## Firestore

- We use Firestore as our database. We have a `firestore.indexes.json` file where we define our indexes. When you add a new query that requires an index, please add it to this file. We wrap a query with the query builder function `buildQueryConstraints` that takes a search input and converts it into Firestore query constraints. This helps us keep our queries consistent and maintainable. The query is accessed from the data layer, which is organized by domain (e.g. `session`, `participant`, `round`, `vote`). Each domain has a set of functions for querying and mutating data related to that domain. When adding new features that require data access, please add the necessary functions to the appropriate domain in the data layer.

We also have `firestore.rules` file where we define our security rules. Please make sure to update the rules if you add new collections or change the structure of existing collections.

### Firestore Query Builder

We have a `buildQueryConstraints` function that takes a search input and builds an array of Firestore query constraints. This function is used in our data layer to build queries based on the search input. The search input can have filters, order, and paging information. The `buildQueryConstraints` function will convert this into the appropriate Firestore query constraints (where, orderBy, limit). When adding new features that require querying Firestore, please use this function to build your query constraints.

```ts
import {
  documentId,
  limit,
  orderBy,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { type FirestoreSearchInput } from "./types";

/**
 * Build query constraints from a search input
 *
 * @param input The search input
 * @param input.filter The filter conditions
 * @param input.order The order conditions
 * @param input.paging The paging conditions
 *
 * @returns The query constraints
 */
export function buildQueryConstraints<T extends Record<string, unknown>>(
  input: FirestoreSearchInput<T>,
): QueryConstraint[] {
  const { filter, order, paging } = input;

  const constraints: QueryConstraint[] = [];

  for (const [field, condition] of Object.entries(filter)) {
    if (field === "id") {
      if (
        typeof condition === "object" &&
        condition &&
        "op" in condition &&
        "value" in condition
      ) {
        constraints.push(where(documentId(), condition.op, condition.value));
      } else {
        constraints.push(where(documentId(), "==", condition));
      }
    } else if (condition !== undefined || condition !== null) {
      if (
        typeof condition === "object" &&
        condition &&
        "op" in condition &&
        "value" in condition
      ) {
        constraints.push(where(field as string, condition.op, condition.value));
      } else {
        constraints.push(where(field as string, "==", condition));
      }
    }
  }

  if (order) {
    constraints.push(orderBy(order.field as string, order.direction));
  }

  if (paging) {
    constraints.push(limit(paging.limit));
  }

  return constraints;
}
```
