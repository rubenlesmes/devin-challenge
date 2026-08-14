import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/authorization/permissions";
import { StatusBadge } from "@/components/console/StatusBadge";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { KycCaseActions, type KycActionAvailability } from "./KycCaseActions";
import { KYC_TRANSITIONS, type KycStatus } from "@/modules/kyc/service";

export const dynamic = "force-dynamic";

export default async function KycCaseDetailPage({ params }: PageProps<"/kyc/[id]">) {
  const user = await getCurrentUser();
  requirePermission(user, "KYC_VIEW");

  const { id } = await params;
  const kycCase = await prisma.kycCase.findUnique({
    where: { id },
    include: { assignedTo: true },
  });
  if (!kycCase) notFound();

  const events = await prisma.auditEvent.findMany({
    where: { entityType: "KYC_CASE", entityId: kycCase.id },
    orderBy: { occurredAt: "desc" },
  });

  const status = kycCase.status as KycStatus;
  const isFinal = KYC_TRANSITIONS[status].length === 0;
  const isMineOrAdmin = user.role === "ADMIN" || kycCase.assignedToUserId === user.id;

  // UI availability only — the server services re-check permission,
  // assignment, and transition rules on every mutation.
  const availability: KycActionAvailability = {
    canAssign:
      status === "PENDING" && (!kycCase.assignedToUserId || kycCase.assignedToUserId === user.id),
    canResume: status === "NEEDS_INFORMATION" && isMineOrAdmin,
    canDecide: status === "IN_REVIEW" && isMineOrAdmin,
    decideDisabledReason: isFinal
      ? "This case has a final decision and can no longer be changed."
      : status === "IN_REVIEW" && !isMineOrAdmin
        ? "This case is assigned to another reviewer."
        : undefined,
  };

  let supportingFacts: string[] = [];
  try {
    const parsed: unknown = kycCase.notes ? JSON.parse(kycCase.notes) : [];
    if (Array.isArray(parsed)) supportingFacts = parsed.filter((f): f is string => typeof f === "string");
  } catch {
    supportingFacts = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/kyc" className="text-sm text-blue-700 hover:underline">
          ← Back to KYC queue
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">{kycCase.caseNumber}</h1>
          <StatusBadge value={kycCase.status} />
          <StatusBadge value={kycCase.riskTier} />
        </div>
      </div>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">Case details</h2>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Customer</dt>
            <dd>{kycCase.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Email</dt>
            <dd>{kycCase.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Country</dt>
            <dd>{kycCase.country}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Assigned to</dt>
            <dd>{kycCase.assignedTo?.name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Created</dt>
            <dd>{kycCase.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Updated</dt>
            <dd>{kycCase.updatedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</dd>
          </div>
        </dl>
        {supportingFacts.length > 0 ? (
          <div className="mt-3">
            <h3 className="text-xs text-gray-500">Synthetic supporting facts</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
              {supportingFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Actions</h2>
        <KycCaseActions caseId={kycCase.id} availability={availability} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Audit timeline</h2>
        <AuditTimeline events={events} />
      </section>
    </div>
  );
}
