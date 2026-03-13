/**
 * auth/PermissionGate.tsx — Conditional renderer based on RBAC permissions.
 *
 * Usage:
 *   <PermissionGate permission="rbac.create">
 *     <button onClick={handleCreate}>Create Role</button>
 *   </PermissionGate>
 *
 * Props:
 *   permission  — single permission string (e.g. "rbac.create")
 *   permissions — array of permissions (user needs at least one)
 *   fallback    — optional fallback UI when denied (default: null / hidden)
 *   disable     — if true, renders children but wrapped in a disabled container
 *                 instead of hiding them entirely
 */
import React, { ReactNode } from "react";
import { usePermissions } from "./PermissionsContext";

interface PermissionGateProps {
  /** Single permission required. */
  permission?: string;
  /** Array of permissions — user needs at least one. */
  permissions?: string[];
  /** What to render when the user lacks permission (default: nothing). */
  fallback?: ReactNode;
  /** If true, render children in a disabled wrapper instead of hiding. */
  disable?: boolean;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  fallback = null,
  disable = false,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();

  // While loading, render nothing (or disabled) to avoid flash of forbidden content
  if (loading) {
    return disable ? (
      <div className="pointer-events-none opacity-40">{children}</div>
    ) : null;
  }

  // Check access
  let allowed = false;
  if (permission) {
    allowed = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    allowed = hasAnyPermission(permissions);
  } else {
    // No permission specified — always show
    allowed = true;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (disable) {
    return (
      <div
        className="pointer-events-none opacity-40 cursor-not-allowed"
        title="You do not have permission for this action"
      >
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
}
