import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, type CurrentUser } from "@/lib/authorization/permissions";
import { writeAuditEvent } from "@/lib/audit/writer";
import { assertTransition, type TransitionMap } from "@/lib/transitions";
import { decisionNoteSchema, parseInput } from "@/lib/validation";
import { forbidden, invalidTransition, notFound, conflict } from "@/lib/errors";

export type KycStatus = "PENDING" | "IN_REVIEW" | "NEEDS_INFORMATION" | "APPROVED" | "REJECTED";

export const KYC_TRANSITIONS: TransitionMap<KycStatus> = {
  PENDING: ["IN_REVIEW"],
  NEEDS_INFORMATION: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED", "NEEDS_INFORMATION"],
  APPROVED: [],
  REJECTED: [],
};

const assignInputSchema = z.object({
  caseId: z.string().min(1),
  expectedVersion: z.number().int().optional(),
});

const decisionInputSchema = z.object({
  caseId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "NEEDS_INFORMATION"]),
  note: decisionNoteSchema,
  expectedVersion: z.number().int().optional(),
});

const resumeInputSchema = z.object({
  caseId: z.string().min(1),
  note: decisionNoteSchema,
  expectedVersion: z.number().int().optional(),
});

function caseSnapshot(c: { status: string; assignedToUserId: string | null }) {
  return { status: c.status, assignedToUserId: c.assignedToUserId };
}

export async function assignKycCaseToMe(
  user: CurrentUser,
  rawInput: unknown,
  db: PrismaClient = prisma,
): Promise<void> {
  requirePermission(user, "KYC_ASSIGN");
  const input = parseInput(assignInputSchema, rawInput);

  await db.$transaction(async (tx) => {
    const kycCase = await tx.kycCase.findUnique({ where: { id: input.caseId } });
    if (!kycCase) throw notFound("KYC case not found.");
    if (input.expectedVersion !== undefined && kycCase.version !== input.expectedVersion) {
      throw conflict();
    }
    assertTransition(KYC_TRANSITIONS, kycCase.status as KycStatus, "IN_REVIEW", "case");
    if (kycCase.assignedToUserId && kycCase.assignedToUserId !== user.id) {
      throw forbidden("This case is already assigned to another reviewer.");
    }

    const before = caseSnapshot(kycCase);
    const updated = await tx.kycCase.update({
      where: { id: kycCase.id },
      data: { assignedToUserId: user.id, status: "IN_REVIEW", version: { increment: 1 } },
    });

    await writeAuditEvent(tx, {
      actor: user,
      action: "KYC_CASE_ASSIGNED",
      entityType: "KYC_CASE",
      entityId: kycCase.id,
      entityDisplayId: kycCase.caseNumber,
      beforeState: before,
      afterState: caseSnapshot(updated),
    });
  });
}

export async function decideKycCase(
  user: CurrentUser,
  rawInput: unknown,
  db: PrismaClient = prisma,
): Promise<void> {
  requirePermission(user, "KYC_DECIDE");
  const input = parseInput(decisionInputSchema, rawInput);

  await db.$transaction(async (tx) => {
    const kycCase = await tx.kycCase.findUnique({ where: { id: input.caseId } });
    if (!kycCase) throw notFound("KYC case not found.");
    if (input.expectedVersion !== undefined && kycCase.version !== input.expectedVersion) {
      throw conflict();
    }
    assertTransition(KYC_TRANSITIONS, kycCase.status as KycStatus, input.decision, "case");

    // Reviewers may only decide cases assigned to them; admins may decide any case.
    if (user.role !== "ADMIN" && kycCase.assignedToUserId !== user.id) {
      throw forbidden("You can only decide cases assigned to you.");
    }

    const before = caseSnapshot(kycCase);
    const updated = await tx.kycCase.update({
      where: { id: kycCase.id },
      data: { status: input.decision, version: { increment: 1 } },
    });

    await writeAuditEvent(tx, {
      actor: user,
      action: `KYC_CASE_${input.decision}`,
      entityType: "KYC_CASE",
      entityId: kycCase.id,
      entityDisplayId: kycCase.caseNumber,
      reason: input.note,
      beforeState: before,
      afterState: caseSnapshot(updated),
    });
  });
}

export async function resumeKycReview(
  user: CurrentUser,
  rawInput: unknown,
  db: PrismaClient = prisma,
): Promise<void> {
  requirePermission(user, "KYC_DECIDE");
  const input = parseInput(resumeInputSchema, rawInput);

  await db.$transaction(async (tx) => {
    const kycCase = await tx.kycCase.findUnique({ where: { id: input.caseId } });
    if (!kycCase) throw notFound("KYC case not found.");
    if (input.expectedVersion !== undefined && kycCase.version !== input.expectedVersion) {
      throw conflict();
    }
    if (kycCase.status !== "NEEDS_INFORMATION") {
      throw invalidTransition("Only cases waiting on information can resume review.");
    }
    assertTransition(KYC_TRANSITIONS, kycCase.status as KycStatus, "IN_REVIEW", "case");
    if (user.role !== "ADMIN" && kycCase.assignedToUserId !== user.id) {
      throw forbidden("You can only resume cases assigned to you.");
    }

    const before = caseSnapshot(kycCase);
    const updated = await tx.kycCase.update({
      where: { id: kycCase.id },
      data: { status: "IN_REVIEW", version: { increment: 1 } },
    });

    await writeAuditEvent(tx, {
      actor: user,
      action: "KYC_CASE_REVIEW_RESUMED",
      entityType: "KYC_CASE",
      entityId: kycCase.id,
      entityDisplayId: kycCase.caseNumber,
      reason: input.note,
      beforeState: before,
      afterState: caseSnapshot(updated),
    });
  });
}
