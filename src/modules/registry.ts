import type { Permission } from "@/lib/authorization/permissions";

export interface ModuleDefinition {
  key: string;
  title: string;
  href: string;
  viewPermission: Permission;
}

export const MODULES: readonly ModuleDefinition[] = [
  { key: "kyc", title: "KYC Review", href: "/kyc", viewPermission: "KYC_VIEW" },
  { key: "refunds", title: "Refunds", href: "/refunds", viewPermission: "REFUND_VIEW" },
  { key: "feature-flags", title: "Feature Flags", href: "/feature-flags", viewPermission: "FEATURE_FLAG_VIEW" },
  { key: "audit", title: "Audit Log", href: "/audit", viewPermission: "AUDIT_VIEW" },
];
