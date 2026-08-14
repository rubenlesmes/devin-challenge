import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import type { CurrentUser, Role } from "@/lib/authorization/permissions";
import { AppError } from "@/lib/errors";

export const PERSONA_COOKIE = "demo_persona";

// Allowlist of demo persona identifiers. The cookie stores only one of these
// IDs; the server resolves the user's name, email, and role from the database.
export const ALLOWED_PERSONA_IDS = ["user-alex-reviewer", "user-morgan-admin"] as const;

export const DEFAULT_PERSONA_ID = "user-alex-reviewer";

export function isAllowedPersonaId(id: string): boolean {
  return (ALLOWED_PERSONA_IDS as readonly string[]).includes(id);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const store = await cookies();
  const raw = store.get(PERSONA_COOKIE)?.value;
  const personaId = raw && isAllowedPersonaId(raw) ? raw : DEFAULT_PERSONA_ID;

  const user = await prisma.user.findUnique({ where: { id: personaId } });
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Demo persona could not be resolved. Reset the database with `npm run db:reset`.");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };
}
