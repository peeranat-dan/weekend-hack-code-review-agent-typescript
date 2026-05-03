export type ExpectedIssue = {
  issue: string;
  category:
    | "Performance"
    | "Functional"
    | "Security"
    | "Convention"
    | "Edge Case"
    | "Code Pattern";
  severity: "High" | "Medium" | "Low";
};

export const gtIteration4: ExpectedIssue[] = [
  {
    issue: "Expensive query due to missing spectator filter",
    category: "Performance",
    severity: "Medium",
  },
  {
    issue: "Duplicate name not handled",
    category: "Functional",
    severity: "High",
  },
  {
    issue: "xlsx library increases bundle size",
    category: "Performance",
    severity: "Medium",
  },
  {
    issue: "Admin role can see additional sidebar items they should not",
    category: "Security",
    severity: "High",
  },
  {
    issue: "Missing Firestore indexes definition",
    category: "Convention",
    severity: "High",
  },
  {
    issue: "N+1 query pattern causes redundant database reads",
    category: "Performance",
    severity: "High",
  },
  {
    issue: "T-shirt session data not mapped correctly",
    category: "Functional",
    severity: "Medium",
  },
  {
    issue: "Vote value of -1 or -2 not handled",
    category: "Edge Case",
    severity: "Medium",
  },
  {
    issue: "Browser side-effect present inside a service",
    category: "Code Pattern",
    severity: "Low",
  },
];
