/**
 * waswaAccess — who may open the Waswa AI Console (/ai).
 *
 * Super admins and internal administrators, plus anyone whose role holds a
 * Waswa permission (waswa.review / waswa.approve) or the module's own ai.view.
 *
 * "admin" is also the role a CUSTOMER organisation's own administrator has
 * (account type "client"). Customers must never reach the console — it shows
 * internal documents and approves what Waswa tells other customers — so the
 * admin roles count only on a non-client account.
 *
 * This decides what the menu shows. The backend applies the same rule to
 * every console request, so hiding or showing a link never grants access.
 */
export const WASWA_CONSOLE_PERMISSION = "ai.view";

const ADMIN_ROLES = ["super_admin", "system"];
const STAFF_ADMIN_ROLES = ["admin", "sysadmin", "sys_admin"];
const CUSTOMER_ACCOUNT_TYPES = ["client", "customer", "customer_tracker"];
const WASWA_PERMISSIONS = ["waswa.review", "waswa.approve"];

export function canOpenWaswaConsole(
  role: string | null | undefined,
  accountType: string | null | undefined,
  permissions: readonly string[],
): boolean {
  const r = (role ?? "").toLowerCase();
  const type = (accountType ?? "").toLowerCase();
  if (ADMIN_ROLES.includes(r)) return true;
  if (STAFF_ADMIN_ROLES.includes(r) && !CUSTOMER_ACCOUNT_TYPES.includes(type)) return true;
  return permissions.includes(WASWA_CONSOLE_PERMISSION)
    || WASWA_PERMISSIONS.some((p) => permissions.includes(p));
}
