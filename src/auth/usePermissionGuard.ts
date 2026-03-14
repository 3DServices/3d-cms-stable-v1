/**
 * auth/usePermissionGuard.ts — Imperative permission check for API mutations.
 *
 * Wraps an async function with a permission check so that even if a UI button
 * is hidden, the underlying API call cannot be triggered without permission.
 *
 * Usage:
 *   const guard = usePermissionGuard();
 *
 *   const handleDelete = () => guard("rbac.delete", async () => {
 *     await deleteRole(roleUid, payload);
 *   });
 */
import { useCallback } from "react";
import { usePermissions } from "./PermissionsContext";

export function usePermissionGuard() {
  const { hasPermission } = usePermissions();

  return useCallback(
    <T,>(permission: string, fn: () => Promise<T>): Promise<T> => {
      if (!hasPermission(permission)) {
        return Promise.reject(
          new Error(
            `Insufficient permissions: "${permission}" is required for this action.`,
          ),
        );
      }
      return fn();
    },
    [hasPermission],
  );
}
