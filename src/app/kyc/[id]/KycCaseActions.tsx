"use client";

import { ActionDialog } from "@/components/actions/ActionDialog";
import { assignCaseAction, decideCaseAction, resumeCaseAction } from "@/app/kyc/actions";

export interface KycActionAvailability {
  canAssign: boolean;
  canDecide: boolean;
  canResume: boolean;
  decideDisabledReason?: string;
}

export function KycCaseActions({
  caseId,
  availability,
}: {
  caseId: string;
  availability: KycActionAvailability;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {availability.canAssign ? (
        <ActionDialog
          triggerLabel="Assign to me"
          title="Assign case to yourself"
          description="The case will move to In Review and be assigned to you."
          confirmLabel="Assign"
          requireNote={false}
          action={() => assignCaseAction(caseId)}
        />
      ) : null}
      {availability.canResume ? (
        <ActionDialog
          triggerLabel="Resume review"
          title="Resume review"
          description="Move this case from Needs Information back to In Review."
          confirmLabel="Resume"
          noteLabel="Note"
          action={(note) => resumeCaseAction(caseId, note)}
        />
      ) : null}
      {availability.canDecide ? (
        <>
          <ActionDialog
            triggerLabel="Approve"
            title="Approve case"
            description="Record an approval decision. This is final."
            confirmLabel="Approve"
            action={(note) => decideCaseAction(caseId, "APPROVED", note)}
          />
          <ActionDialog
            triggerLabel="Reject"
            title="Reject case"
            description="Record a rejection decision. This is final."
            confirmLabel="Reject"
            tone="danger"
            action={(note) => decideCaseAction(caseId, "REJECTED", note)}
          />
          <ActionDialog
            triggerLabel="Request information"
            title="Request information"
            description="Move this case to Needs Information."
            confirmLabel="Request information"
            action={(note) => decideCaseAction(caseId, "NEEDS_INFORMATION", note)}
          />
        </>
      ) : availability.decideDisabledReason ? (
        <p className="text-sm text-gray-500">{availability.decideDisabledReason}</p>
      ) : null}
    </div>
  );
}
