---
name: add-internal-tool-module
description: Add a new internal operations module using the repository's shared queue, authorization, transition, audit, and testing patterns.
---

# Add an Internal-Tool Module

Use this Skill to add a new queue-based internal operations module (like KYC Review, Refunds, or Feature Flags) to the Fintech Operations Console.

## 1. Understand the repository

1. Read `AGENTS.md` in full — its rules are non-negotiable.
2. Read one deep module (`src/modules/kyc/service.ts`, `src/app/kyc/`) and one thin module (`src/modules/refunds/`, `src/app/refunds/`) as reference implementations.

## 2. Define the module contract before writing code

Clarify with the requester, or infer and document in the PR:

- The **entity** (fields, display identifier like `KYC-1001`).
- The **statuses** and the allowed **transition map**.
- The **actions** (each needs: required permission, valid source statuses, whether a decision note/reason ≥ 10 characters is required).
- The **permissions** (`<MODULE>_VIEW`, `<MODULE>_DECIDE`, etc.) and which of `REVIEWER`/`ADMIN` get them.
- The queue's **search fields and filters**.
- The **audit actions** to record.

## 3. Plan parallelism (optional)

Schema, permissions, and the service contract must land before UI/tests build on them. If delegating: one workstream owns `src/modules/<module>/` + `src/app/<module>/`; only the integration thread edits shared files (`src/lib/**`, `src/components/**`, `prisma/schema.prisma`, `src/modules/registry.ts`, `prisma/seed.ts`). Never create a second permission model, audit writer, transition helper, or error type.

## 4. Implement

1. **Schema**: add the model to `prisma/schema.prisma` (include `version Int @default(0)`, timestamps, a unique display number). Run `npm run db:reset`.
2. **Seed**: add ≥ 8 synthetic rows to `prisma/seed.ts` with varied statuses and a stable, documented demo record. Use the `.test` email domain; never real names or data.
3. **Permissions**: add `<MODULE>_*` permissions to the `Permission` union and role map in `src/lib/authorization/permissions.ts`.
4. **Service**: create `src/modules/<module>/service.ts`. Every mutation must:
   - accept `(user: CurrentUser, rawInput: unknown, db: PrismaClient = prisma)` for testability;
   - call `requirePermission` first;
   - `parseInput` a Zod schema (use `decisionNoteSchema` for notes);
   - inside one `db.$transaction`: load the record, check `expectedVersion` if provided, `assertTransition` against the module's transition map, perform the update with `version: { increment: 1 }`, then `writeAuditEvent(tx, …)` with before/after snapshots.
5. **UI**: pages under `src/app/<module>/` reusing `DataTable`, `FilterBar`, `StatusBadge`, `ActionDialog`, `AuditTimeline`. Mutations only via a thin `actions.ts` (`"use server"`) that resolves the user with `getCurrentUser`, calls the service, `revalidatePath`, and returns an `ActionResult` via `toActionResult`. UI may hide/disable unauthorized actions but is never the security control.
6. **Navigation**: register the module in `src/modules/registry.ts`.

## 5. Test

Add `tests/<module>.test.ts` (pattern: `tests/refunds.test.ts`) covering at minimum:

- permitted action → state change + audit event with actor, reason, before/after;
- denied action (missing permission or ownership boundary) → rejected, no state change, no audit event;
- invalid transition → rejected, no state change, no audit event;
- note/reason validation.

Run `npm run check` (lint + typecheck + tests + build) — all must pass. If route types fail, run `npx next typegen`.

## 6. Verify in the browser

`npm run db:reset && npm run dev`, then exercise the queue, filters, the happy-path action as an authorized persona, and the denial path as an unauthorized persona. Confirm the audit log shows the events. Check ~375px width usability and the browser console for errors.

## 7. Integrate and deliver

1. If work was parallel, integrate into one branch, resolve interface mismatches centrally, and rerun `npm run check`.
2. Update `README.md` (capabilities, demo script if a new stable record was added).
3. Open a pull request using `.github/PULL_REQUEST_TEMPLATE/DEVIN_PR_TEMPLATE.md`. Do **not** merge it.
