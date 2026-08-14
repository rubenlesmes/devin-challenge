import { execSync } from "node:child_process";
import path from "node:path";

export const TEST_DB_PATH = path.resolve(__dirname, "..", "prisma", "vitest.db");

export default function setup() {
  execSync("npx prisma db push --force-reset --skip-generate", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./vitest.db" },
    stdio: "inherit",
  });
}
