## feat(session): add export votes as xlsx for admin and owner

The PR adds an export votes to Excel feature for session admins/owners:

- New "Export" button in Game Settings modal (owners & admins only)
- useExportSessionVotes hook handles the export logic
- buildVotesWorkbook utility builds the .xlsx file from vote data, with unit tests
- Added xlsx library + dependencies to support Excel generation
