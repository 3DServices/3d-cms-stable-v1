/**
 * auth/ProtectedRoute.tsx — Route guard based on RBAC permissions.
 *
 * Usage:
 *   <Route path="/audit" element={
 *     <ProtectedRoute permission="audit.view">
 *       <AuditPage />
 *     </ProtectedRoute>
 *   } />
 *
 * If the user lacks the required permission, an "Access Denied" screen is shown.
 * While permissions are loading, a spinner is displayed.
 */
import React, { ReactNode } from "react";
import { usePermissions } from "./PermissionsContext";

interface ProtectedRouteProps {
  /** The permission string required to access this route (e.g. "audit.view") */
  permission: string;
  children: ReactNode;
}

export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#128C7E] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-[#667781]">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F0F2F5]">
        <div className="bg-white rounded-xl border border-[#E9EDEF] p-8 max-w-md text-center shadow-sm">
          <div className="text-[40px] mb-3">🔒</div>
          <h2 className="text-[18px] font-bold text-[#111B21] mb-2">
            Access Denied
          </h2>
          <p className="text-[13px] text-[#667781] mb-4">
            You do not have the <strong>{permission}</strong> permission
            required to view this page.
          </p>
          <p className="text-[12px] text-[#667781]">
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
