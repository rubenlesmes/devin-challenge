import type { Tx } from "@/lib/db/prisma";
import type { CurrentUser } from "@/lib/authorization/permissions";

export interface AuditEventInput {
  actor: CurrentUser;
  action: string;
  entityType: "KYC_CASE" | "REFUND" | "FEATURE_FLAG";
  entityId: string;
  entityDisplayId: string;
  reason?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Append-only writer: audit events are only ever created, never updated or
// deleted, and always inside the same transaction as the business mutation.
export async function writeAuditEvent(tx: Tx, input: AuditEventInput): Promise<void> {
  await tx.auditEvent.create({
    data: {
      actorUserId: input.actor.id,
      actorName: input.actor.name,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      entityDisplayId: input.entityDisplayId,
      reason: input.reason ?? null,
      beforeState: input.beforeState ? JSON.stringify(input.beforeState) : null,
      afterState: input.afterState ? JSON.stringify(input.afterState) : null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}
