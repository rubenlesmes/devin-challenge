# AGENTS.md — Fintech Operations Console

Repository-specific instructions for Devin sessions and other coding agents.

## Setup and Commands

```bash
npm install        # installs deps and runs `prisma generate`
npm run db:reset   # prisma db push --force-reset + seed (synthetic data)
npm run dev        # dev server at http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (isolated SQLite db at prisma/vitest.db)
npm run build      # production build (also regenerates route types)
npm run check      # lint + typecheck + test + build — must pass before any PR
```

If `typecheck` fails on `PageProps<...>` route types after adding a route, run `npx next typegen` (or `npm run build`) to regenerate them.

## Architecture

Modular monolith, Next.js App Router, TypeScript strict, Prisma + SQLite, Zod, Tailwind.

- `src/lib/authorization/permissions.ts` — the ONLY role→permission map; `requirePermission(user, permission)`.
- `src/lib/auth/session.ts` — server-side persona resolution from an allowlisted HTTP-only cookie. The client never supplies roles or permissions.
- `src/lib/transitions/` — `assertTransition(map, from, to, label)` for declarative state machines.
- `src/lib/audit/writer.ts` — `writeAuditEvent(tx, …)`; append-only, always called inside the business transaction.
- `src/lib/validation/` — Zod helpers (`decisionNoteSchema`, `parseInput`).
- `src/lib/errors/` — typed `AppError` + `ActionResult`; never leak stack traces to the browser.
- `src/modules/<module>/service.ts` — all business mutations. Module UI lives in `src/app/<module>/`.
- `src/modules/registry.ts` — navigation metadata for modules.
- `src/components/` — shared UI: `DataTable`, `FilterBar`, `StatusBadge`, `ActionDialog`, `AuditTimeline`, `ConsoleShell`, `EmptyState`.
- `prisma/schema.prisma` + `prisma/seed.ts` — schema and synthetic seed data.
- `tests/` — service-level integration tests against `prisma/vitest.db`.

## Non-Negotiable Rules

1. **All mutations go through server-side services** in `src/modules/*/service.ts`. Server actions in `src/app/*/actions.ts` are thin wrappers; no business logic in React components or route handlers.
2. **Every mutation validates its input** with Zod via `parseInput`.
3. **Every mutation enforces permissions** with `requirePermission` from the central map. Do not create a second authorization mechanism.
4. **Every status change enforces the transition policy** with `assertTransition` against the module's transition map.
5. **Every successful state-changing action creates an audit event atomically** — `writeAuditEvent(tx, …)` inside the same `$transaction` as the business update.
6. **Authorization failures and invalid transitions create neither state changes nor audit events** (throw before any write).
7. **Tests must accompany** every new permission, transition, and action: permitted-action, denied-action, invalid-transition, and audit tests.
8. **No production data or credentials.** Synthetic data only; `.test` email domain; no external service calls.
9. Do not weaken TypeScript strictness; avoid `any`; no `dangerouslySetInnerHTML`.
10. Audit events are append-only — never expose update or delete operations for them.

## Pull-Request Workflow

- Never commit to `main`. Branch as `devin/<short-description>`, open a PR (use `.github/PULL_REQUEST_TEMPLATE/DEVIN_PR_TEMPLATE.md`), do not merge it yourself.
- `npm run check` must pass before opening the PR.
- Update `README.md` (and this file, if conventions change) when adding a new module.

## Adding a Module

Follow the Skill at `.agents/skills/add-internal-tool-module/SKILL.md`.

## Parallel Development

- Establish shared contracts first (schema, permissions, transition maps, audit contract) before parallel module work.
- File ownership: one workstream per `src/modules/<module>` + `src/app/<module>` pair; shared files (`src/lib/**`, `src/components/**`, `prisma/schema.prisma`, `src/modules/registry.ts`) are owned by the integration thread — coordinate edits, never edit concurrently.
- Parallel agents must NOT create competing core abstractions (a second permission model, audit writer, transition helper, or error type). Reuse `src/lib/**`.
- Integrate in coherent increments; run `npm test` after each integration and `npm run check` on the final integrated branch.
