"use client";

import { ActionDialog } from "@/components/actions/ActionDialog";
import { decideRefundAction } from "@/app/refunds/actions";

export function RefundActions({ refundId, isPending }: { refundId: string; isPending: boolean }) {
  if (!isPending) {
    return <p className="text-sm text-gray-500">This refund has a final decision.</p>;
  }
  return (
    <div className="flex flex-wrap gap-3">
      <ActionDialog
        triggerLabel="Approve refund"
        title="Approve refund"
        description="Record an approval decision. This is final."
        confirmLabel="Approve"
        action={(note) => decideRefundAction(refundId, "APPROVED", note)}
      />
      <ActionDialog
        triggerLabel="Reject refund"
        title="Reject refund"
        description="Record a rejection decision. This is final."
        confirmLabel="Reject"
        tone="danger"
        action={(note) => decideRefundAction(refundId, "REJECTED", note)}
      />
    </div>
  );
}
