import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function createFileWithContent(filePath: string, content: string) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, { flag: "wx" });
}
