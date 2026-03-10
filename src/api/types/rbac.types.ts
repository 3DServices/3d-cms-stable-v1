/**
 * rbac.types.ts — Types for Roles, Permissions & RBAC endpoints.
 *
 * Matches backend responses from /rbac/roles and /rbac/permissions.
 */

// ── Permission ───────────────────────────────────────────────────────────────

export interface RbacPermission {
  permission_uid: string;
  permission_name: string;
  permission_description: string;
  permission_module: string;
  account_root?: string;
  created_by?: string;
  created_at?: string;
}

// ── Role ─────────────────────────────────────────────────────────────────────

export interface RbacRole {
  role_uid: string;
  role_name: string;
  role_description: string;
  account_root: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  permissions?: RbacPermission[];
}

// ── Role Detail (single role with permissions) ───────────────────────────────

export interface RbacRoleDetail extends RbacRole {
  permissions: RbacPermission[];
}

// ── User Permissions ─────────────────────────────────────────────────────────

export interface RbacUserPermissions {
  role: string;
  role_uid: string;
  permissions: RbacPermission[];
}

// ── Create Role ──────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  role_name: string;
  role_description: string;
  account_root: string;
  created_by: string;
  permissions: string[];
}

export interface CreateRoleResponse {
  role_uid: string;
}

// ── Update Role ──────────────────────────────────────────────────────────────

export interface UpdateRoleRequest {
  role_name?: string;
  role_description?: string;
  permissions?: string[];
  updated_by: string;
}

// ── Delete Role ──────────────────────────────────────────────────────────────

export interface DeleteRoleRequest {
  deleted_by: string;
}
