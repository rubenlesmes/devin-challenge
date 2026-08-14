import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { seed } from "../prisma/seed";
import type { CurrentUser } from "@/lib/authorization/permissions";

const testDbUrl = `file:${path.resolve(__dirname, "..", "prisma", "vitest.db")}`;

export const testDb = new PrismaClient({ datasourceUrl: testDbUrl });

export async function resetTestDb(): Promise<void> {
  await seed(testDb);
}

export const ALEX: CurrentUser = {
  id: "user-alex-reviewer",
  name: "Alex Reviewer",
  email: "alex.reviewer@example.test",
  role: "REVIEWER",
};

export const MORGAN: CurrentUser = {
  id: "user-morgan-admin",
  name: "Morgan Admin",
  email: "morgan.admin@example.test",
  role: "ADMIN",
};
