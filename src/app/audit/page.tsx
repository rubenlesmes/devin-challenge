import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/authorization/permissions";
import { DataTable } from "@/components/data-table/DataTable";
import { FilterBar } from "@/components/filters/FilterBar";

export const dynamic = "force-dynamic";

const ENTITY_TYPES = ["KYC_CASE", "REFUND", "FEATURE_FLAG"];

function summarize(json: string | null): string {
  if (!json) return "—";
  try {
    const obj: unknown = JSON.parse(json);
    if (obj && typeof obj === "object") {
      return Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(", ");
    }
  } catch {
    return "—";
  }
  return "—";
}

export default async function AuditLogPage({ searchParams }: PageProps<"/audit">) {
  const user = await getCurrentUser();
  requirePermission(user, "AUDIT_VIEW");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const actor = typeof params.actor === "string" ? params.actor : "";
  const entityType =
    typeof params.entity === "string" && ENTITY_TYPES.includes(params.entity) ? params.entity : "";

  const actors = await prisma.user.findMany({ orderBy: { name: "asc" } });

  const where: Prisma.AuditEventWhereInput = {
    ...(q
      ? {
          OR: [
            { action: { contains: q } },
            { entityDisplayId: { contains: q } },
            { reason: { contains: q } },
          ],
        }
      : {}),
    ...(actor ? { actorUserId: actor } : {}),
    ...(entityType ? { entityType } : {}),
  };

  const events = await prisma.auditEvent.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Audit Log</h1>
        <p className="text-sm text-gray-500">
          Read-only, append-only application audit trail. This is an application-level
          demonstration, not a tamper-evident or regulator-grade audit system.
        </p>
      </div>
      <FilterBar
        action="/audit"
        searchPlaceholder="Action, entity, or reason"
        searchValue={q}
        selects={[
          {
            name: "actor",
            label: "Actor",
            value: actor,
            options: actors.map((a) => ({ value: a.id, label: a.name })),
          },
          {
            name: "entity",
            label: "Entity type",
            value: entityType,
            options: ENTITY_TYPES.map((e) => ({ value: e, label: e.replaceAll("_", " ") })),
          },
        ]}
      />
      <DataTable
        rows={events}
        rowKey={(e) => e.id}
        emptyMessage="No audit events match the current filters."
        columns={[
          {
            header: "Timestamp",
            cell: (e) => (
              <span className="whitespace-nowrap">
                {e.occurredAt.toISOString().replace("T", " ").slice(0, 19)} UTC
              </span>
            ),
          },
          { header: "Actor", cell: (e) => e.actorName },
          { header: "Action", cell: (e) => e.action.replaceAll("_", " ") },
          { header: "Entity", cell: (e) => `${e.entityType.replaceAll("_", " ")} · ${e.entityDisplayId}` },
          { header: "Reason", cell: (e) => e.reason ?? "—" },
          {
            header: "Change",
            cell: (e) => (
              <span className="text-xs text-gray-600">
                {summarize(e.beforeState)} → {summarize(e.afterState)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
