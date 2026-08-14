import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, type CurrentUser } from "@/lib/authorization/permissions";
import { writeAuditEvent } from "@/lib/audit/writer";
import { decisionNoteSchema, parseInput } from "@/lib/validation";
import { notFound, conflict } from "@/lib/errors";

const toggleFlagSchema = z.object({
  flagId: z.string().min(1),
  enabled: z.boolean(),
  reason: decisionNoteSchema,
  expectedVersion: z.number().int().optional(),
});

export async function toggleFeatureFlag(
  user: CurrentUser,
  rawInput: unknown,
  db: PrismaClient = prisma,
): Promise<void> {
  requirePermission(user, "FEATURE_FLAG_MANAGE");
  const input = parseInput(toggleFlagSchema, rawInput);

  await db.$transaction(async (tx) => {
    const flag = await tx.featureFlag.findUnique({ where: { id: input.flagId } });
    if (!flag) throw notFound("Feature flag not found.");
    if (input.expectedVersion !== undefined && flag.version !== input.expectedVersion) {
      throw conflict();
    }

    const before = { enabled: flag.enabled };
    const updated = await tx.featureFlag.update({
      where: { id: flag.id },
      data: { enabled: input.enabled, version: { increment: 1 } },
    });

    await writeAuditEvent(tx, {
      actor: user,
      action: input.enabled ? "FEATURE_FLAG_ENABLED" : "FEATURE_FLAG_DISABLED",
      entityType: "FEATURE_FLAG",
      entityId: flag.id,
      entityDisplayId: `${flag.key} (${flag.environment})`,
      reason: input.reason,
      beforeState: before,
      afterState: { enabled: updated.enabled },
    });
  });
}
