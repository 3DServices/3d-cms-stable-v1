# NAVAS RBAC Implementation Report

**Project:** 3D CMS Frontend (NAVAS NOC Console)
**Date:** 14 May 2026
**Author:** Agatha
**Scope:** Three-slice refactor introducing a registry-driven, permission-aware routing and role-management layer for the NAVAS operations console.

---

## Context

The NAVAS console serves as the unified operations dashboard for 3D Services Ltd's telecom and mobile-money infrastructure. Permission and role management was already partially built — an `AuthContext`, `PermissionsContext`, `PermissionGate`, `ProtectedRoute`, and an existing RBAC page with a wizard-based role-creation flow were in place. However, the system had three structural weaknesses. Route declarations were hand-rolled with permission strings duplicated across `App.tsx` and the sidebar. Role creation was wizard-driven from a hardcoded subset of permissions rather than from a comprehensive catalog. Mutation buttons across the app were not systematically gated against the user's actual permissions, which meant the UI was permissive even when the backend would later reject the call. A mockup attached to the task (`navas_permissions_by_module.html`) defined the full target catalog of approximately 450 permissions organised across 45 modules, giving us a complete source-of-truth for the canonical permission set.

## Architectural Decision

An initial seven-phase plan was tightened into a single architectural principle: declare each module exactly once in a typed registry and derive every downstream concern from that one declaration. The route table, the sidebar visibility filter, the role-creator UI, and the eventual backend seed script all read from the registry rather than maintaining parallel data. This compresses what would otherwise be multiple drift-prone sources of truth and makes new-module additions a one-file change. The work was split into three independently shippable slices, each leaving the application in a working state.

## Slice 1 — Module Registry as Single Source of Truth

The first slice introduced the registry foundation. `src/auth/permissionCatalog.ts` extracts the mockup's full permission catalog into typed TypeScript constants, exposing `PERMISSION_CATALOG`, a `PermissionKey` union, a flattened `ALL_PERMISSIONS` array, and a reverse index `PERMISSION_TO_MODULE`. `src/auth/modules.ts` then declares the registry proper: each app module is paired with its route, view permission, nav glyph and label, group classification, and a link to its catalog entry. Modules present in the mockup but not yet built in the app receive catalog-only entries with no route and no nav slot, so the Role Creator can still render their permissions for selection while keeping the runtime free of dead routes. The helpers `getModuleById`, `getModuleByRoute`, `getModulesForSidebar`, `getModulesForNavRail`, and `getRoutableModules` provide the typed lookups consumers need.

`src/auth/guards.tsx` introduced `useCan(perm)` as a missing boolean primitive plus a `<ModuleRouteGuard moduleId>` that resolves the permission from the registry rather than requiring it at every call site. `src/app/moduleRoutes.tsx` maps module ids to page elements and exports `generateModuleRoutes()` returning a permission-gated `<Route>` array — a function rather than a wrapper component because react-router inspects `<Routes>` children directly. `App.tsx` was reduced to a landing route, the generated module routes, and a 404 catch-all. The `Sidebar` and `NavRail` were refactored in place to derive their default items from the registry while preserving brand-specific names like "Signal Vault" and "Money Switchboard."

## Slice 2 — Modular Role Creator

The second slice delivered the most visible new capability: a `/rbac/roles/new` and `/rbac/roles/:uid/edit` page where administrators assemble custom roles from the full permission catalog. `src/features/rbac/components/ModulePermissionBlock.tsx` is the reusable widget that mirrors the mockup — an expandable card per module with a permission-tile grid — but in selectable form. It supports two modes (`select` for the creator, `view` for read-only displays) and includes bulk helpers per module: Select all, View-only, and Clear. Each module block surfaces its legacy `module.view` permission as the first tile labelled "module access," so newly created roles grant real route access today even before backend migration.

`src/features/rbac/RoleCreatorPage.tsx` composes these blocks. The page reads `MODULES` from the registry, renders the role-name and description fields, a single search box that filters across both module names and permission keys, a live selection counter ("12 permissions across 3 modules"), and one `<ModulePermissionBlock>` per module. On submit it routes through `usePermissionGuard` and the existing `rbacService.createRole` and `updateRole` endpoints. The existing RBAC page's "+ Create Role" button and the role-detail blade's "Edit" affordance were both rewired to navigate to the new page rather than open the previous wizard.

## Slice 3 — Action-Level Enforcement Layer

The third slice closed the runtime gap where routes were gated and roles were rich, but individual action buttons across the app had no systematic permission check. `src/auth/permissionAliases.ts` introduced a pure resolver mapping any catalog `can_*` key to its legacy `module.action` equivalent — using the registry for module lookup and a small verb table for action translation (view/browse/read map to view; create/add/register to create; edit/configure/manage to update; delete/decommission/suspend to delete; approve/authorize/acknowledge to approve; and so on). `PermissionsContext.hasPermission` and `hasAnyPermission` were updated to consult the resolver, so a user granted `rbac.create` now also satisfies `can_create_user`, and vice-versa. This single change makes both permission styles interoperable without requiring a backend migration.

Two new primitives in `guards.tsx` standardise the mutation pattern. `useGuardedMutation(permission, fn)` returns `{ mutate, canRun, isRunning, error, reset }` for any async action, with a pre-flight permission check that prevents the underlying function from even running if the user lacks the right. `<GuardedButton permission>` ties button state to permission state automatically, rendering an explanatory tooltip when disabled, with an optional `fallback="hide"` variant for cases where the action should disappear entirely. The pilot migration on `RoleCreatorPage` switches its imperative `usePermissionGuard` calls from literal `"rbac.create"` and `"rbac.update"` to catalog `"can_create_user"` and `"can_edit_user"`, exercising the alias resolution end-to-end with no behavioural change for users.

## Compatibility Design

A central design constraint was that no backend changes could block frontend progress. The alias resolver achieves this by translating catalog keys at the permission-check layer to whatever the backend already grants. Roles created today are saved as a mix of legacy `module.view` keys and new `can_*` catalog keys; permission checks succeed on either form. When the backend eventually seeds the catalog into its own permissions table, the frontend needs no further changes — it has been speaking both languages from day one and the cutover is a no-op.

## Status and Verification

After each slice, `tsc -b --force` was run against the project and exited cleanly with no type errors. The route surface remains identical to the pre-refactor state with the same permission keys, the sidebar and nav rail show the same destinations in registry-ordered groupings, and the existing wizard, modals, and tables remain operational. The Role Creator is reachable from the RBAC page's "+ Create Role" button and from the role-detail blade's "Edit" action. A tail-truncation issue with the file-editing tools required two manual recoveries via shell append during the work; both files were validated with brace-balance checks and now compile cleanly.

## Migration Runway

The architecture is in place; the remaining work is incremental adoption. Each mutation button across the feature folders can now be migrated independently to `useGuardedMutation` and `<GuardedButton>` without touching shared infrastructure. The suggested order by risk is Assets and Twin Atlas first, then Payments and Money, then RBAC's own mutating actions, then Alarms, and finally the rest of the system. Optional polish work that can land independently includes role templates (Read-Only, Operator, Finance, and Compliance presets surfaced as starting points in the creator), a "Test as this role" preview that re-renders the app with an in-progress role's permissions so administrators can see exactly what gets hidden before saving, and a backend seed script that pushes the catalog into the permissions table when the backend team is available to coordinate.

## File Inventory

The work added six new files and modified six existing ones. New: `src/auth/permissionCatalog.ts`, `src/auth/modules.ts`, `src/auth/guards.tsx`, `src/auth/permissionAliases.ts`, `src/app/moduleRoutes.tsx`, `src/features/rbac/components/ModulePermissionBlock.tsx`, and `src/features/rbac/RoleCreatorPage.tsx`. Modified: `src/auth/PermissionsContext.tsx` (alias-aware permission checks), `src/app/App.tsx` (registry-driven routing), `src/components/navigation/Sidebar.tsx` and `src/components/navigation/NavRail.tsx` (registry-driven items), `src/features/rbac/index.ts` (export `RoleCreatorPage`), and `src/features/rbac/RbacPage.tsx` (navigate to new creator, pilot alias usage).
