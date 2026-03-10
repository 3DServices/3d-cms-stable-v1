/**
 * rbac.service.ts — RBAC Roles & Permissions API service.
 *
 * Endpoints:
 *   GET    /rbac/roles?account_root=       → getAllRoles
 *   GET    /rbac/roles/{role_uid}          → getRoleByUid
 *   POST   /rbac/roles/create             → createRole
 *   PUT    /rbac/roles/{role_uid}/update   → updateRole
 *   DELETE /rbac/roles/{role_uid}/delete   → deleteRole
 *   GET    /rbac/permissions?account_root= → getAllPermissions
 *   GET    /rbac/users/{account_uid}/permissions → getUserPermissions
 */

import { get, post, put, del } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type {
  RbacRole,
  RbacRoleDetail,
  RbacPermission,
  RbacUserPermissions,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  DeleteRoleRequest,
} from "../types";

/** List all roles for a given account root. */
export function getAllRoles(
  accountRoot: string,
  opts?: RequestOptions,
): Promise<ApiResponse<RbacRole[]>> {
  return get<RbacRole[]>(ENDPOINTS.RBAC.ROLES, {
    ...opts,
    params: { account_root: accountRoot, ...opts?.params },
  });
}

/** Get a single role by UID (includes permissions). */
export function getRoleByUid(
  roleUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<RbacRoleDetail>> {
  return get<RbacRoleDetail>(`${ENDPOINTS.RBAC.ROLES_BY_UID}/${roleUid}`, opts);
}

/** Create a new role with permissions. */
export function createRole(
  payload: CreateRoleRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<CreateRoleResponse>> {
  return post<CreateRoleResponse>(ENDPOINTS.RBAC.ROLES_CREATE, { data: payload }, opts);
}

/** Update a role (name, description, permissions). */
export function updateRole(
  roleUid: string,
  payload: UpdateRoleRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<string>> {
  return put<string>(`${ENDPOINTS.RBAC.ROLES_UPDATE}/${roleUid}/update`, { data: payload }, opts);
}

/** Delete a role. */
export function deleteRole(
  roleUid: string,
  payload: DeleteRoleRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<string>> {
  return del<string>(`${ENDPOINTS.RBAC.ROLES_DELETE}/${roleUid}/delete`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
}

/** List all permissions for a given account root. */
export function getAllPermissions(
  accountRoot: string,
  opts?: RequestOptions,
): Promise<ApiResponse<RbacPermission[]>> {
  return get<RbacPermission[]>(ENDPOINTS.RBAC.PERMISSIONS, {
    ...opts,
    params: { account_root: accountRoot, ...opts?.params },
  });
}

/** Get permissions for a specific user. */
export function getUserPermissions(
  accountUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<RbacUserPermissions>> {
  return get<RbacUserPermissions>(
    `${ENDPOINTS.RBAC.USER_PERMISSIONS}/${accountUid}/permissions`,
    opts,
  );
}
