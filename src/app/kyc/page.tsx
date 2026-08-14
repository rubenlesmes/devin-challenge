import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/authorization/permissions";
import { DataTable } from "@/components/data-table/DataTable";
import { FilterBar } from "@/components/filters/FilterBar";
import { StatusBadge } from "@/components/console/StatusBadge";

export const dynamic = "force-dynamic";

const KYC_STATUSES = ["PENDING", "IN_REVIEW", "NEEDS_INFORMATION", "APPROVED", "REJECTED"];
const RISK_TIERS = ["LOW", "MEDIUM", "HIGH"];

export default async function KycQueuePage({ searchParams }: PageProps<"/kyc">) {
  const user = await getCurrentUser();
  requirePermission(user, "KYC_VIEW");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" && KYC_STATUSES.includes(params.status) ? params.status : "";
  const risk = typeof params.risk === "string" && RISK_TIERS.includes(params.risk) ? params.risk : "";
  const mine = params.mine === "1";
  const sort = params.sort === "risk" ? "risk" : "created";

  const where: Prisma.KycCaseWhereInput = {
    ...(q
      ? {
          OR: [
            { caseNumber: { contains: q } },
            { customerName: { contains: q } },
            { customerEmail: { contains: q } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(risk ? { riskTier: risk } : {}),
    ...(mine ? { assignedToUserId: user.id } : {}),
  };

  const cases = await prisma.kycCase.findMany({
    where,
    include: { assignedTo: true },
    orderBy: sort === "created" ? { createdAt: "desc" } : undefined,
  });
  if (sort === "risk") {
    const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    cases.sort((a, b) => (order[a.riskTier] ?? 3) - (order[b.riskTier] ?? 3));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">KYC Review</h1>
      <FilterBar
        action="/kyc"
        searchPlaceholder="Case number, customer name, or email"
        searchValue={q}
        selects={[
          {
            name: "status",
            label: "Status",
            value: status,
            options: KYC_STATUSES.map((s) => ({ value: s, label: s.replaceAll("_", " ") })),
          },
          {
            name: "risk",
            label: "Risk tier",
            value: risk,
            options: RISK_TIERS.map((r) => ({ value: r, label: r })),
          },
          {
            name: "sort",
            label: "Sort by",
            value: sort,
            options: [
              { value: "created", label: "Newest first" },
              { value: "risk", label: "Highest risk first" },
            ],
          },
        ]}
        checkboxes={[{ name: "mine", label: "Assigned to me", checked: mine }]}
      />
      <DataTable
        rows={cases}
        rowKey={(c) => c.id}
        columns={[
          {
            header: "Case",
            cell: (c) => (
              <Link href={`/kyc/${c.id}`} className="font-medium text-blue-700 hover:underline">
                {c.caseNumber}
              </Link>
            ),
          },
          { header: "Customer", cell: (c) => `${c.customerName} · ${c.customerEmail}` },
          { header: "Country", cell: (c) => c.country },
          { header: "Risk", cell: (c) => <StatusBadge value={c.riskTier} /> },
          { header: "Status", cell: (c) => <StatusBadge value={c.status} /> },
          { header: "Assigned to", cell: (c) => c.assignedTo?.name ?? "Unassigned" },
          { header: "Created", cell: (c) => c.createdAt.toISOString().slice(0, 10) },
        ]}
      />
    </div>
  );
}
