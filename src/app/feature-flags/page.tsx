import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, requirePermission } from "@/lib/authorization/permissions";
import { DataTable } from "@/components/data-table/DataTable";
import { FilterBar } from "@/components/filters/FilterBar";
import { StatusBadge } from "@/components/console/StatusBadge";
import { FlagToggle } from "./FlagToggle";

export const dynamic = "force-dynamic";

const ENVIRONMENTS = ["DEVELOPMENT", "STAGING", "PRODUCTION"];

export default async function FeatureFlagsPage({ searchParams }: PageProps<"/feature-flags">) {
  const user = await getCurrentUser();
  requirePermission(user, "FEATURE_FLAG_VIEW");
  const canManage = hasPermission(user, "FEATURE_FLAG_MANAGE");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const environment =
    typeof params.env === "string" && ENVIRONMENTS.includes(params.env) ? params.env : "";
  const enabled = params.enabled === "true" ? true : params.enabled === "false" ? false : undefined;

  const where: Prisma.FeatureFlagWhereInput = {
    ...(q
      ? {
          OR: [
            { key: { contains: q } },
            { description: { contains: q } },
            { owner: { contains: q } },
          ],
        }
      : {}),
    ...(environment ? { environment } : {}),
    ...(enabled !== undefined ? { enabled } : {}),
  };

  const flags = await prisma.featureFlag.findMany({
    where,
    orderBy: [{ key: "asc" }, { environment: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Feature Flags</h1>
      {!canManage ? (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          You can view flags but toggling requires the Admin role. The server rejects
          unauthorized toggles regardless of what the UI shows.
        </p>
      ) : null}
      <FilterBar
        action="/feature-flags"
        searchPlaceholder="Key, description, or owner"
        searchValue={q}
        selects={[
          {
            name: "env",
            label: "Environment",
            value: environment,
            options: ENVIRONMENTS.map((e) => ({ value: e, label: e })),
          },
          {
            name: "enabled",
            label: "State",
            value: enabled === undefined ? "" : String(enabled),
            options: [
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ],
          },
        ]}
      />
      <DataTable
        rows={flags}
        rowKey={(f) => f.id}
        columns={[
          { header: "Key", cell: (f) => <span className="font-medium">{f.key}</span> },
          { header: "Description", cell: (f) => f.description },
          { header: "Environment", cell: (f) => <StatusBadge value={f.environment} /> },
          { header: "State", cell: (f) => <StatusBadge value={f.enabled ? "ENABLED" : "DISABLED"} /> },
          { header: "Owner", cell: (f) => f.owner },
          { header: "Updated", cell: (f) => f.updatedAt.toISOString().replace("T", " ").slice(0, 16) },
          {
            header: "Actions",
            cell: (f) => (
              <FlagToggle
                flagId={f.id}
                flagKey={f.key}
                environment={f.environment}
                enabled={f.enabled}
                canManage={canManage}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
