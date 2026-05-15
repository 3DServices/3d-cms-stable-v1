/**
 * auth/guards.tsx — Permission-guard primitives that read from the module
 * registry and the user's permission set. Sits on top of <PermissionGate>,
 * <ProtectedRoute>, and usePermissions; adds:
 *
 *   - useCan(perm)                — boolean hook for inline checks
 *   - <ModuleRouteGuard id="x">   — wrap a route element with the module's
 *                                   viewPermission (looked up from registry)
 *   - useGuardedMutation(perm,fn) — standard mutation hook: returns
 *                                   { mutate, canRun, isRunning, error, reset }
 *   - <GuardedButton perm="...">  — button that auto-disables (or hides)
 *                                   when the user lacks the permission
 *
 * `hasPermission` itself (in PermissionsContext) checks both the literal key
 * and its legacy alias (see auth/permissionAliases.ts), so callers can pass
 * either `can_*` or `module.action` style and it just works.
 */

import React, { ReactNode, useCallback, useState } from "react";
import { usePermissions } from "./PermissionsContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { getModuleById } from "./modules";

// ── useCan ───────────────────────────────────────────────────────────────────

/**
 * Boolean hook for inline permission checks.
 *
 *   const canCreate = useCan("can_create_unit");
 *   <Button disabled={!canCreate}>Create</Button>
 *
 * - Returns `true` if no permission is required (undefined / empty string).
 * - Returns `false` while permissions are still loading, to fail closed.
 */
export function useCan(permission?: string | null): boolean {
  const { hasPermission, loading } = usePermissions();
  if (!permission) return true;
  if (loading) return false;
  return hasPermission(permission);
}

// ── ModuleRouteGuard ─────────────────────────────────────────────────────────

interface ModuleRouteGuardProps {
  /** Module id as declared in modules.ts (e.g. "rbac", "audit"). */
  moduleId: string;
  children: ReactNode;
}

/**
 * Wraps a route's element with the module's `viewPermission` from the
 * registry. If the module has no `viewPermission` (e.g. landing pages),
 * children render unguarded.
 */
export function ModuleRouteGuard({
  moduleId,
  children,
}: ModuleRouteGuardProps) {
  const mod = getModuleById(moduleId);

  if (!mod) {
    if (typeof console !== "undefined") {
      console.warn(
        `[ModuleRouteGuard] Unknown module id: "${moduleId}". Add it to modules.ts.`,
      );
    }
    return <>{children}</>;
  }

  if (!mod.viewPermission) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute permission={mod.viewPermission}>{children}</ProtectedRoute>
  );
}

// ── useGuardedMutation ───────────────────────────────────────────────────────

export interface GuardedMutation<TArgs extends unknown[], TResult> {
  /** Trigger the mutation. Resolves on success; rejects on failure or denied. */
  mutate: (...args: TArgs) => Promise<TResult>;
  /** True iff the current user has the required permission. */
  canRun: boolean;
  /** True while the underlying fn is in flight. */
  isRunning: boolean;
  /** Last error from the mutation; cleared by reset() or a successful run. */
  error: Error | null;
  /** Clear the captured error. */
  reset: () => void;
}

/**
 * The standard pattern for any mutation in the app. Wraps an async function
 * with a pre-flight permission check, captures loading + error state, and
 * exposes `canRun` for buttons to bind to their disabled state.
 *
 *   const createUnit = useGuardedMutation("can_create_unit", unitsService.create);
 *   <button disabled={!createUnit.canRun || createUnit.isRunning}
 *           onClick={() => createUnit.mutate(payload)}>
 *     {createUnit.isRunning ? "Saving…" : "Create"}
 *   </button>
 *
 * If `canRun` is false, `mutate` rejects without calling `fn` — even if
 * something else (e.g. URL tampering, dev tools) triggered it. This is the
 * defense-in-depth layer that makes service calls impossible without the
 * proper permission.
 */
export function useGuardedMutation<TArgs extends unknown[], TResult>(
  permission: string,
  fn: (...args: TArgs) => Promise<TResult>,
): GuardedMutation<TArgs, TResult> {
  const canRun = useCan(permission);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      if (!canRun) {
        const err = new Error(
          `Insufficient permissions: "${permission}" is required for this action.`,
        );
        setError(err);
        throw err;
      }
      setIsRunning(true);
      setError(null);
      try {
        const result = await fn(...args);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setIsRunning(false);
      }
    },
    [canRun, fn, permission],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, canRun, isRunning, error, reset };
}

// ── GuardedButton ────────────────────────────────────────────────────────────

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface GuardedButtonProps extends ButtonProps {
  /** Permission required to enable this button. */
  permission: string;
  /**
   * Behavior when the user lacks the permission:
   *   "disable" — render the button disabled with an explanatory tooltip (default)
   *   "hide"    — render nothing at all
   */
  fallback?: "disable" | "hide";
  /** Override the auto-generated tooltip shown when disabled. */
  deniedTitle?: string;
}

/**
 * A `<button>` that ties its enabled state to the current user's permission.
 *
 *   <GuardedButton permission="can_delete_unit" onClick={handleDelete}>
 *     Delete
 *   </GuardedButton>
 *
 * Use `fallback="hide"` if a missing permission should remove the button
 * entirely rather than disable it. Disabled mode is the default because it
 * helps users discover what actions exist (so they can request access).
 */
export function GuardedButton({
  permission,
  fallback = "disable",
  deniedTitle,
  disabled,
  onClick,
  title,
  children,
  ...rest
}: GuardedButtonProps) {
  const canRun = useCan(permission);

  if (!canRun && fallback === "hide") return null;

  const effectiveDisabled = disabled || !canRun;
  const effectiveTitle = !canRun
    ? deniedTitle ?? `Requires permission: ${permission}`
    : title;

  return (
    <button
      {...rest}
      disabled={effectiveDisabled}
      title={effectiveTitle}
      onClick={canRun ? onClick : undefined}
    >
      {children}
    </button>
  );
}
