import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser, ALLOWED_PERSONA_IDS } from "@/lib/auth/session";
import { switchPersona } from "@/app/actions";
import { MODULES } from "@/modules/registry";
import { prisma } from "@/lib/db/prisma";

export async function ConsoleShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const personas = await prisma.user.findMany({
    where: { id: { in: [...ALLOWED_PERSONA_IDS] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-amber-100 px-4 py-1 text-center text-xs font-medium text-amber-900">
        Synthetic demonstration data — no production systems are connected
      </div>
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">Fintech Operations Console</p>
            <p className="text-xs text-gray-500">Internal-tools proof of concept</p>
          </div>
          <form action={switchPersona} className="flex flex-wrap items-center gap-2">
            <div className="text-right text-xs text-gray-600">
              <p>
                <span className="font-medium text-gray-900">{user.name}</span> ({user.role})
              </p>
              <p>Demo identity — not production authentication</p>
            </div>
            <label htmlFor="personaId" className="sr-only">
              Switch demo persona
            </label>
            <select
              id="personaId"
              name="personaId"
              defaultValue={user.id}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Switch
            </button>
          </form>
        </div>
        <nav aria-label="Modules" className="mx-auto mt-3 max-w-6xl">
          <ul className="flex flex-wrap gap-2">
            {MODULES.map((mod) => (
              <li key={mod.key}>
                <Link
                  href={mod.href}
                  className="inline-block rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {mod.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
