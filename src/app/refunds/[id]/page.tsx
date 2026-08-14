import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/authorization/permissions";
import { StatusBadge } from "@/components/console/StatusBadge";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { RefundActions } from "./RefundActions";
import { formatAmount } from "@/modules/refunds/format";

export const dynamic = "force-dynamic";

export default async function RefundDetailPage({ params }: PageProps<"/refunds/[id]">) {
  const user = await getCurrentUser();
  requirePermission(user, "REFUND_VIEW");

  const { id } = await params;
  const refund = await prisma.refund.findUnique({ where: { id } });
  if (!refund) notFound();

  const events = await prisma.auditEvent.findMany({
    where: { entityType: "REFUND", entityId: refund.id },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/refunds" className="text-sm text-blue-700 hover:underline">
          ← Back to refunds
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">{refund.refundNumber}</h1>
          <StatusBadge value={refund.status} />
        </div>
      </div>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">Refund details</h2>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Customer</dt>
            <dd>{refund.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Amount</dt>
            <dd>{formatAmount(refund.amountCents, refund.currency)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Reason</dt>
            <dd>{refund.reason}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Requested by</dt>
            <dd>{refund.requestedBy}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Created</dt>
            <dd>{refund.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Updated</dt>
            <dd>{refund.updatedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Actions</h2>
        <RefundActions refundId={refund.id} isPending={refund.status === "PENDING"} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Audit timeline</h2>
        <AuditTimeline events={events} />
      </section>
    </div>
  );
}
