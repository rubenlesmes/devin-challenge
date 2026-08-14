import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, type CurrentUser } from "@/lib/authorization/permissions";
import { writeAuditEvent } from "@/lib/audit/writer";
import { assertTransition, type TransitionMap } from "@/lib/transitions";
import { decisionNoteSchema, parseInput } from "@/lib/validation";
import { notFound, conflict } from "@/lib/errors";

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED";

export const REFUND_TRANSITIONS: TransitionMap<RefundStatus> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

const refundDecisionSchema = z.object({
  refundId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: decisionNoteSchema,
  expectedVersion: z.number().int().optional(),
});

export async function decideRefund(
  user: CurrentUser,
  rawInput: unknown,
  db: PrismaClient = prisma,
): Promise<void> {
  requirePermission(user, "REFUND_DECIDE");
  const input = parseInput(refundDecisionSchema, rawInput);

  await db.$transaction(async (tx) => {
    const refund = await tx.refund.findUnique({ where: { id: input.refundId } });
    if (!refund) throw notFound("Refund not found.");
    if (input.expectedVersion !== undefined && refund.version !== input.expectedVersion) {
      throw conflict();
    }
    assertTransition(REFUND_TRANSITIONS, refund.status as RefundStatus, input.decision, "refund");

    const before = { status: refund.status };
    const updated = await tx.refund.update({
      where: { id: refund.id },
      data: { status: input.decision, version: { increment: 1 } },
    });

    await writeAuditEvent(tx, {
      actor: user,
      action: `REFUND_${input.decision}`,
      entityType: "REFUND",
      entityId: refund.id,
      entityDisplayId: refund.refundNumber,
      reason: input.note,
      beforeState: before,
      afterState: { status: updated.status },
      metadata: { amountCents: refund.amountCents, currency: refund.currency },
    });
  });
}
