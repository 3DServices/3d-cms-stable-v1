/**
 * auth/permissionAliases.ts — Resolves new-style `can_*` permission keys to
 * their legacy `module.action` equivalents so the runtime check can match
 * either form.
 *
 * Why this exists: the permissions catalog (mockup) uses
 * `can_<action>_<object>` keys, but the backend currently grants permissions
 * in the older `module.action` style (e.g. `rbac.create`, `audit.view`).
 * Rather than block Slice 3 enforcement on a backend migration, we resolve
 * the two styles transparently. Calling `hasPermission("can_create_user")`
 * succeeds for a user who has `rbac.create`.
 *
 * Resolution is pure — no async, no I/O. Encoded as a function (rather than
 * a hardcoded map) so adding modules to the registry automatically extends
 * coverage; only new action verbs need to be added to ACTION_VERB_MAP.
 */

import { PERMISSION_TO_MODULE, type CatalogModuleName } from "./permissionCatalog";
import { MODULES } from "./modules";

// ── Catalog module name → app module id ──────────────────────────────────────
//
// e.g. "Users & Permissions" → "rbac", "Assets & Unit Registry" → "asset-digital-twin".
// Built once at module load from the registry.

const CATALOG_TO_APP_MODULE: ReadonlyMap<CatalogModuleName, string> = (() => {
  const m = new Map<CatalogModuleName, string>();
  for (const mod of MODULES) {
    if (mod.catalogModuleName && !m.has(mod.catalogModuleName)) {
      m.set(mod.catalogModuleName, mod.id);
    }
  }
  return m;
})();

// ── Action verb mapping ──────────────────────────────────────────────────────
//
// The leading verb of a `can_*` key (e.g. `can_<verb>_*`) maps to one of the
// legacy actions the backend understands. Conservative mapping — only verbs
// we're confident about. Unmapped verbs return no alias and fall back to a
// literal-only check.

const ACTION_VERB_MAP: Readonly<Record<string, string>> = Object.freeze({
  view: "view",
  browse: "view",
  read: "view",
  list: "view",
  monitor: "view",
  query: "view",

  create: "create",
  add: "create",
  register: "create",
  generate: "create",
  issue: "create",

  edit: "update",
  update: "update",
  configure: "update",
  manage: "update",
  set: "update",
  customize: "update",
  calibrate: "update",
  map: "update",
  apply: "update",
  clone: "update",
  pair: "update",
  unpair: "update",
  reroute: "update",
  reactivate: "update",
  resume: "update",
  pause: "update",

  delete: "delete",
  remove: "delete",
  decommission: "delete",
  revoke: "delete",
  cancel: "delete",
  archive: "delete",
  suspend: "delete",
  deactivate: "delete",
  freeze: "delete",
  blacklist: "delete",
  reject: "delete",

  approve: "approve",
  signoff: "approve",
  authorize: "approve",
  acknowledge: "approve",
  release: "approve",
  enforce: "approve",
  override: "approve",

  assign: "assign",
  unassign: "assign",
  invite: "assign",
  provision: "assign",
  allocate: "assign",
  transfer: "assign",
  dispatch: "assign",
  reinstate: "assign",

  export: "export",
  download: "export",
  share: "export",
  import: "export",
  bulk: "export",
});

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Given a `can_<verb>_<...>` permission key, return its legacy
 * `<moduleId>.<action>` equivalent, or `null` if the key doesn't follow the
 * convention or its module/verb can't be resolved.
 *
 * Examples:
 *   legacyAlias("can_create_user")   // → "rbac.create"
 *   legacyAlias("can_view_unit")     // → "asset-digital-twin.view"
 *   legacyAlias("rbac.create")       // → null  (already legacy)
 *   legacyAlias("can_zorg_unit")     // → null  (unknown verb)
 */
export function legacyAlias(permissionKey: string): string | null {
  if (!permissionKey.startsWith("can_")) return null;

  const catalogModule = PERMISSION_TO_MODULE[permissionKey];
  if (!catalogModule) return null;

  const appModuleId = CATALOG_TO_APP_MODULE.get(catalogModule);
  if (!appModuleId) return null;

  // Extract the first verb after `can_`. e.g. "can_view_live_video_stream" → "view"
  const rest = permissionKey.slice(4); // strip "can_"
  const firstWord = rest.split("_")[0];
  const action = ACTION_VERB_MAP[firstWord];
  if (!action) return null;

  return `${appModuleId}.${action}`;
}

/**
 * Memoized variant for hot paths. Same shape as `legacyAlias`, but caches
 * results across calls. Cache is unbounded (the catalog has ~450 entries —
 * an acceptable bounded set).
 */
const aliasCache = new Map<string, string | null>();
export function legacyAliasMemo(permissionKey: string): string | null {
  if (aliasCache.has(permissionKey)) return aliasCache.get(permissionKey)!;
  const v = legacyAlias(permissionKey);
  aliasCache.set(permissionKey, v);
  return v;
}
