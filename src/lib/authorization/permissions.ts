import { forbidden } from "@/lib/errors";

export type Role = "REVIEWER" | "ADMIN";

export type Permission =
  | "KYC_VIEW"
  | "KYC_ASSIGN"
  | "KYC_DECIDE"
  | "REFUND_VIEW"
  | "REFUND_DECIDE"
  | "FEATURE_FLAG_VIEW"
  | "FEATURE_FLAG_MANAGE"
  | "AUDIT_VIEW";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  REVIEWER: new Set<Permission>([
    "KYC_VIEW",
    "KYC_ASSIGN",
    "KYC_DECIDE",
    "REFUND_VIEW",
    "REFUND_DECIDE",
    "FEATURE_FLAG_VIEW",
    "AUDIT_VIEW",
  ]),
  ADMIN: new Set<Permission>([
    "KYC_VIEW",
    "KYC_ASSIGN",
    "KYC_DECIDE",
    "REFUND_VIEW",
    "REFUND_DECIDE",
    "FEATURE_FLAG_VIEW",
    "FEATURE_FLAG_MANAGE",
    "AUDIT_VIEW",
  ]),
};

export function hasPermission(user: CurrentUser, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].has(permission);
}

export function requirePermission(user: CurrentUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw forbidden(permissionDeniedMessage(permission));
  }
}

function permissionDeniedMessage(permission: Permission): string {
  switch (permission) {
    case "FEATURE_FLAG_MANAGE":
      return "You do not have permission to modify feature flags.";
    default:
      return "You do not have permission to perform this action.";
  }
}
