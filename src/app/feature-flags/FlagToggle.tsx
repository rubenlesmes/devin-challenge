"use client";

import { ActionDialog } from "@/components/actions/ActionDialog";
import { toggleFlagAction } from "@/app/feature-flags/actions";

export function FlagToggle({
  flagId,
  flagKey,
  environment,
  enabled,
  canManage,
}: {
  flagId: string;
  flagKey: string;
  environment: string;
  enabled: boolean;
  canManage: boolean;
}) {
  const next = !enabled;
  return (
    <ActionDialog
      triggerLabel={enabled ? "Disable" : "Enable"}
      title={`${next ? "Enable" : "Disable"} ${flagKey} (${environment})`}
      description={`Confirm you want to ${next ? "enable" : "disable"} this flag. A change reason is required and will be recorded in the audit log.`}
      confirmLabel={next ? "Enable flag" : "Disable flag"}
      noteLabel="Change reason"
      tone={next ? "primary" : "danger"}
      action={(reason) => toggleFlagAction(flagId, next, reason)}
      disabled={!canManage}
      disabledReason={canManage ? undefined : "Requires the FEATURE_FLAG_MANAGE permission (Admin)."}
    />
  );
}
