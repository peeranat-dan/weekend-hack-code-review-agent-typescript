# As an session owner, I want to export current session vote as xlsx

So that I can validate for estimated vs actual later

## Acceptance Criteria

### **Access Control**

- Only `owner` and `admin` can trigger the export; other roles are rejected.

### **File Output**

- Downloading triggers a file named `<session-name>-votes.xlsx`.
- The workbook contains a single sheet named after the session (truncated to 31 chars).

### **Sheet Structure**

- Columns: `Round | <participant names...> | Average`
- Participants include all non-spectators (including those who left or were removed).
- Each row represents one revealed/finished round, ordered by creation time (ascending).
- Round column is a 1-based index.
- If the player name is duplicated, we might add their uids to the header after their name e.g. name-uid

### **Data Accuracy**

- Each participant cell shows their vote value for that round, or blank if they did not vote.
- The `Average` column shows the round's computed average, or blank if unavailable.

### **UI**

- In the general settings tab, the owner of the session can see the "Download votes (.xlsx)" button

## Metadata

- URL: [https://linear.app/ninprd/issue/PRJS-112/as-an-session-owner-i-want-to-export-current-session-vote-as-xlsx](https://linear.app/ninprd/issue/PRJS-112/as-an-session-owner-i-want-to-export-current-session-vote-as-xlsx)
- Identifier: PRJS-112
- Status: In Progress
- Priority: No priority
- Assignee: Unassigned
- Project: [Planning Poker](https://linear.app/ninprd/project/planning-poker-4132e65bdb76/overview). A planning poker for improving code understanding for myself
- Created: 2026-04-15T09:12:03.410Z
- Updated: 2026-04-15T09:24:15.105Z
