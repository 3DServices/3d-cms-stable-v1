/**
 * auth/PermissionsContext.tsx — Frontend RBAC permissions provider.
 *
 * Reads the logged-in user's account_uid from the _nvxs_account_uid cookie,
 * calls GET /rbac/users/{account_uid}/permissions, and exposes:
 *   - permissions: string[]        — list of permission names (e.g. "audit.view")
 *   - role: string                 — user's role name
 *   - hasPermission(p): boolean    — check a single permission
 *   - hasAnyPermission(ps): boolean — check if user has at least one
 *   - loading: boolean
 *
 * super_admin and system roles bypass all permission checks (full access).
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getUserPermissions } from "../api/services/rbac.service";

// ── Cookie helper ────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  try {
    const v = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return v ? decodeURIComponent(v.pop() || "") : null;
  } catch {
    return null;
  }
}

// ── Bypass roles (full access, no permission checks needed) ──────────────────

const BYPASS_ROLES = ["super_admin", "system"];

// ── Context shape ────────────────────────────────────────────────────────────

interface PermissionsContextValue {
  permissions: string[];
  role: string;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refetch: () => void;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    const accountUid = getCookie("_nvxs_account_uid");
    if (!accountUid) {
      // Not logged in — clear state
      setPermissions([]);
      setRole("");
      setLoading(false);
      return;
    }

    try {
      const res = await getUserPermissions(accountUid);
      const data = res.data;
      setRole(data.role ?? "");
      setPermissions(
        (data.permissions ?? []).map((p) => p.permission_name),
      );
    } catch {
      // API error — default to no permissions (safe fail-closed)
      setPermissions([]);
      setRole("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Bypass roles have full access
      if (BYPASS_ROLES.includes(role)) return true;
      return permissions.includes(permission);
    },
    [permissions, role],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (BYPASS_ROLES.includes(role)) return true;
      return perms.some((p) => permissions.includes(p));
    },
    [permissions, role],
  );

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        role,
        loading,
        hasPermission,
        hasAnyPermission,
        refetch: fetchPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx)
    throw new Error("usePermissions must be used inside <PermissionsProvider>");
  return ctx;
}
