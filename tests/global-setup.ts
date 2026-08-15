import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

export const TEST_DB_PATH = path.resolve(__dirname, "..", "prisma", "vitest.db");

export default function setup() {
  // Deleting the local SQLite file and re-pushing the schema is equivalent to
  // `db push --force-reset` for a file-based database, and works in
  // environments where force-reset is gated (e.g. AI-assisted sessions).
  rmSync(TEST_DB_PATH, { force: true });
  execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./vitest.db" },
    stdio: "inherit",
  });
}
