import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/authorization/permissions";
import { DataTable } from "@/components/data-table/DataTable";
import { FilterBar } from "@/components/filters/FilterBar";
import { StatusBadge } from "@/components/console/StatusBadge";
import { formatAmount } from "@/modules/refunds/format";

export const dynamic = "force-dynamic";

const REFUND_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export default async function RefundsPage({ searchParams }: PageProps<"/refunds">) {
  const user = await getCurrentUser();
  requirePermission(user, "REFUND_VIEW");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status =
    typeof params.status === "string" && REFUND_STATUSES.includes(params.status)
      ? params.status
      : "";

  const where: Prisma.RefundWhereInput = {
    ...(q
      ? {
          OR: [{ refundNumber: { contains: q } }, { customerName: { contains: q } }],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const refunds = await prisma.refund.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Refunds</h1>
      <FilterBar
        action="/refunds"
        searchPlaceholder="Refund number or customer"
        searchValue={q}
        selects={[
          {
            name: "status",
            label: "Status",
            value: status,
            options: REFUND_STATUSES.map((s) => ({ value: s, label: s })),
          },
        ]}
      />
      <DataTable
        rows={refunds}
        rowKey={(r) => r.id}
        columns={[
          {
            header: "Refund",
            cell: (r) => (
              <Link href={`/refunds/${r.id}`} className="font-medium text-blue-700 hover:underline">
                {r.refundNumber}
              </Link>
            ),
          },
          { header: "Customer", cell: (r) => r.customerName },
          { header: "Amount", cell: (r) => formatAmount(r.amountCents, r.currency) },
          { header: "Reason", cell: (r) => r.reason },
          { header: "Requested by", cell: (r) => r.requestedBy },
          { header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
          { header: "Created", cell: (r) => r.createdAt.toISOString().slice(0, 10) },
        ]}
      />
    </div>
  );
}
