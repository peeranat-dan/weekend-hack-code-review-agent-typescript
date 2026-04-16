## Thinking

### package.json / pnpm-lock.yaml

- Adds `xlsx@^0.18.5` (SheetJS community edition) and its transitive deps (adler-32, cfb, codepage, crc-32, frac, ssf, wmf, word).
- xlsx is ~800KB minified — will materially increase bundle size. No lazy loading strategy applied.

### src/containers/game-settings-modal.tsx

- Changes General tab role from `['owner']` to `['owner', 'admin']`.
- This means admins now see **all** content in General settings: session info, export, **and the Danger Zone (terminate session)**.
- Need to verify `SessionTerminationButton` has its own role check restricting to owner-only. The business rules say only owner can terminate.

### src/containers/game-settings/general-settings.tsx

- Adds an "Export" section between SessionInfo and Danger Zone with the new `SessionExportButton`.

### src/containers/session-export-button.tsx

- Container component wiring the mutation hook to a Button with loading state and toasts.
- `useCallback` with `exportMutation` dep — TanStack Query v5 returns a stable mutation object, so this is fine but also unnecessary since the component re-renders on `isPending` anyway.
- No role check at the UI level — relies on the tab visibility and service-layer guard. Acceptable.

### src/hooks/session/use-export-session-votes.ts

- Thin `useMutation` wrapper. Clean, follows conventions.

### src/lib/xlsx/build-votes-workbook.ts

- Core logic: filters spectators, builds `['Round', ...names, 'Average']` header, maps rounds to rows with 1-based indexing, uses empty string for missing votes/null average.
- Sheet name truncated to 31 chars (Excel limit).
- **No duplicate participant name handling**: The AC says "If the player name is duplicated, we might add their uids to the header after their name e.g. name-uid." This is not implemented — duplicate names will produce identical column headers.
- Vote values are shown as raw numbers. For t-shirt sessions, values 0–5 will appear instead of "XS"–"XXL". Not addressed.

### src/lib/xlsx/**tests**/build-votes-workbook.test.ts

- Good coverage: sheet naming, truncation, header-only, vote filling, missing votes, spectator exclusion, sequential numbering, null average.
- **Missing test**: duplicate participant names behavior.

### src/services/session/export-session-votes.ts

- Access control via `checkIfUserCanManageSession` — correct.
- Fetches session, participants, rounds in parallel — good.
- **N+1 query problem**: For each round, a separate `searchVotes` call is made. The architecture doc explicitly warns against this. Should batch using `roundId` with `in` operator (Firestore supports up to 30 values per `in` clause, batch if more).
- `XLSX.writeFile` side effect in the service layer — a download is triggered directly. Service functions ideally shouldn't have browser side effects, but this is pragmatic for a client-side app.
- Rounds filter uses `status: { op: 'in', value: ['finished', 'revealed'] }` — correct per AC.

### src/lib/xlsx/index.ts

- Barrel export. Follows convention.

---

## Summary

Adds an "Export votes (.xlsx)" feature allowing session owners and admins to download all voting data as an Excel file. Includes a new `buildVotesWorkbook` utility with unit tests, a service function that fetches data and triggers download, and UI wiring in the General Settings tab.

## Files Changed

- **package.json** — adds `xlsx` dependency
- **pnpm-lock.yaml** — lockfile update
- **src/containers/game-settings-modal.tsx** — admins can now see General tab
- **src/containers/game-settings/general-settings.tsx** — adds Export section
- **src/containers/session-export-button.tsx** — new export button container
- **src/hooks/session/use-export-session-votes.ts** — mutation hook
- **src/lib/xlsx/build-votes-workbook.ts** — workbook builder utility
- **src/lib/xlsx/**tests**/build-votes-workbook.test.ts** — unit tests
- **src/lib/xlsx/index.ts** — barrel export
- **src/services/session/export-session-votes.ts** — orchestrates data fetch + download

## System Impact

- **Data layer**: `searchParticipants`, `searchRounds`, `searchVotes` all used; N+1 pattern on votes
- **Service layer**: new `exportSessionVotes` function
- **UI**: General Settings tab now visible to admins; new export button
- **Bundle**: xlsx library adds significant size (~800KB) with no code splitting

## Risk Areas

1. **N+1 query on votes** — one Firestore call per round; will degrade with many rounds
2. **Admin sees Danger Zone** — `game-settings-modal.tsx` change exposes terminate button to admins; verify `SessionTerminationButton` enforces owner-only
3. **Duplicate participant names** — AC mentions appending uid but not implemented; identical headers possible
4. **T-shirt vote display** — numeric values (0–5) shown instead of display values (XS–XXL)
5. **xlsx bundle size** — statically imported, not lazy-loaded
6. **xlsx@0.18.5 licensing** — community edition; later versions changed license. 0.18.5 is Apache 2.0, acceptable, but be aware of future upgrades

## Suggested Focus

- **`src/services/session/export-session-votes.ts`** — N+1 vote fetching is the most impactful issue; refactor to batch `searchVotes` with `in` operator on round IDs
- **`src/containers/game-settings-modal.tsx`** — confirm terminate button has independent owner-only guard now that admins see General tab
- **`src/lib/xlsx/build-votes-workbook.ts`** — duplicate name deduplication logic missing per AC
- **Bundle impact** — consider `await import('xlsx')` in the service to lazy-load only on export click

## Unresolved Questions

1. Should duplicate participant names append uid to headers as mentioned in AC?
2. Should t-shirt votes display "XS"/"S"/"M" etc. instead of numeric values in the spreadsheet?
3. Is the terminate button in Danger Zone protected by owner-only role check independent of tab visibility?
4. Should xlsx be lazy-loaded to avoid bundle size impact on initial load?
5. Should the export button be disabled when there are no revealed/finished rounds?
