## Summary

Adds an "Export votes" feature that lets session owners and admins download all voting data as an `.xlsx` file. Also grants admins access to the General settings menu where the export button lives.

## Files Changed

- **`package.json` / `pnpm-lock.yaml`** — Adds `xlsx@0.18.5` dependency
- **`game-settings-modal.tsx`** — Adds `'admin'` to General settings menu roles
- **`general-settings.tsx`** — Adds "Export" section with `SessionExportButton`
- **`session-export-button.tsx`** — New: button component triggering export mutation
- **`use-export-session-votes.ts`** — New: TanStack Query mutation hook
- **`export-session-votes.ts`** — New: orchestrates data fetching, workbook build, and file download
- **`build-votes-workbook.ts`** — New: pure function constructing the XLSX workbook from domain data
- **`build-votes-workbook.test.ts`** — New: 7 unit tests for workbook builder
- **`index.ts`** — New: barrel export for xlsx lib

## System Impact

- **Permissions**: Admins now see General settings (was owner-only). This exposes Session Termination to admins as well — confirm this is intentional.
- **Data access**: `checkIfUserCanManageSession` gates the export; spectators cannot export.
- **Bundle size**: `xlsx` is ~900KB unminified; adds significant client-side weight since `XLSX.writeFile` includes file-writing logic that wouldn't tree-shake.
- **Network**: Export fetches all rounds + all votes per round sequentially via `Promise.all` — could be heavy for sessions with many rounds.

## Risk Areas

- **Admin now sees "Danger Zone" / Session Termination** via the General settings role change. This may be unintended scope creep beyond export access.
- **`xlsx@0.18.5`**: This is the last free version of SheetJS Community Edition. It's a large dependency; consider whether server-side export or a lighter alternative (e.g., generating CSV) would suffice.
- **N+1 query pattern**: `searchVotes` is called once per round inside `Promise.all`. With many rounds this could be many concurrent reads.
- **No `displayName` sanitization**: Participant display names are used directly as headers — could contain characters that confuse Excel or cause formula injection.
- **Sheet name truncation** slices at 31 chars with no uniqueness guarantee — two sessions with the same 31-char prefix produce identical sheet names (only one sheet here, so low risk).

## Suggested Focus

- **Role change in `game-settings-modal.tsx`**: Verify admins _should_ see the entire General tab (including Danger Zone / termination), not just export.
- **`build-votes-workbook.ts`**: Correctness of missing-vote handling, spectator filtering, and edge cases.
- **Bundle impact of `xlsx`**: Confirm team is okay with the client-side size increase; consider lazy-loading the export path.
