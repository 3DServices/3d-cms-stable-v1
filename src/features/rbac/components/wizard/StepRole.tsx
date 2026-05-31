/**
 * StepRole — Create a role by selecting permissions module-by-module from the
 * full permission catalog. Uses the modular collapsible ModulePermissionBlock
 * UI matching the NAVAS permissions-by-module mockup.
 *
 * Permissions are sourced from the catalog (src/auth/permissionCatalog.ts) —
 * NOT fetched from the backend. This guarantees all 38 modules and 400+
 * permissions are always visible, even if the backend seed hasn't run yet.
 */

import React, { useMemo, useState } from "react";
import { createRole } from "../../../../api";
import { useAuth } from "../../../../auth/AuthContext";
import { MODULES, type ModuleDef } from "../../../../auth/modules";
import { getCatalogPermissions } from "../../../../auth/permissionCatalog";
import { ModulePermissionBlock } from "../ModulePermissionBlock";
import { MSection, Field, StepSuccessBanner, ErrorBanner, INPUT_CLS, SELECT_CLS, BTN_PRIMARY } from "./WizardShared";

interface Props {
  preSelectedPermissionUids?: string[];
  onSuccess: (roleName?: string) => void;
  onClose: () => void;
  onNext: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the full list of permission keys for a module (legacy viewPerm + catalog). */
function getModulePermissionKeys(m: ModuleDef): string[] {
  const catalogPerms = m.catalogModuleName
    ? Array.from(getCatalogPermissions(m.catalogModuleName))
    : [];
  if (m.viewPermission && !catalogPerms.includes(m.viewPermission)) {
    return [m.viewPermission, ...catalogPerms];
  }
  return catalogPerms;
}

/** Permissions whose name implies read-only access. */
function isViewOnlyKey(key: string): boolean {
  return /(^|_|\.)(view|browse|read|list|monitor)(_|\.|$)/i.test(key);
}

// ── Component ────────────────────────────────────────────────────────────────

export function StepRole({ preSelectedPermissionUids, onSuccess, onClose, onNext }: Props) {
  const { state: { accountUid, accountRoot } } = useAuth();

  // Role details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("Tenant");

  // Permission selection
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(preSelectedPermissionUids ?? []),
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Per-module key lookup (memoized) ────────────────────────────────────────
  const moduleKeysById = useMemo(() => {
    const out = new Map<string, string[]>();
    for (const m of MODULES) out.set(m.id, getModulePermissionKeys(m));
    return out;
  }, []);

  // ── Counter: total selected + how many modules they span ───────────────────
  const selectionCounter = useMemo(() => {
    if (selected.size === 0) return { perms: 0, modules: 0 };
    let modules = 0;
    for (const m of MODULES) {
      const keys = moduleKeysById.get(m.id) ?? [];
      if (keys.some((k) => selected.has(k))) modules++;
    }
    return { perms: selected.size, modules };
  }, [selected, moduleKeysById]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggle = (key: string, next: boolean) => {
    setSelected((prev) => {
      const out = new Set(prev);
      if (next) out.add(key);
      else out.delete(key);
      return out;
    });
  };

  const handleBulkReplace = (moduleKeys: readonly string[], action: "all" | "view-only" | "none") => {
    setSelected((prev) => {
      const out = new Set(prev);
      for (const k of moduleKeys) out.delete(k);
      if (action === "all") {
        for (const k of moduleKeys) out.add(k);
      } else if (action === "view-only") {
        for (const k of moduleKeys) if (isViewOnlyKey(k)) out.add(k);
      }
      return out;
    });
  };

  async function handleCreate() {
    if (!name.trim() || selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createRole({
        role_name: name.trim(),
        role_description: description.trim(),
        account_root: accountRoot ?? "engine",
        created_by: accountUid ?? "system",
        permissions: Array.from(selected),
      });
      setSuccess(`Role "${name.trim()}" created with ${selected.size} permission(s) across ${selectionCounter.modules} module(s).`);
      onSuccess(name.trim());
    } catch (err: any) {
      setError(err?.apiMessage ?? err?.message ?? "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {success && (
        <StepSuccessBanner
          message={success}
          nextLabel="Proceed to Create User"
          onNext={onNext}
          onClose={onClose}
        />
      )}
      {error && <ErrorBanner message={error} />}

      {/* ── Role details ─────────────────────────────────────────────── */}
      <MSection title="Role Details">
        <div className="flex flex-col gap-3">
          <Field label="Role Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. fleet_manager" className={INPUT_CLS} />
          </Field>
          <Field label="Role Description">
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this role's purpose" className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scope" required>
              <select value={scope} onChange={(e) => setScope(e.target.value)} className={SELECT_CLS}>
                <option>Platform</option>
                <option>Tenant</option>
                <option>Customer</option>
                <option>Dealer</option>
              </select>
            </Field>
            <Field label="Selection Summary">
              <div className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] bg-white flex items-center gap-1">
                <span className={selected.size > 0 ? "font-extrabold text-[#128C7E]" : "text-[#667781]"}>
                  {selectionCounter.perms}
                </span>
                <span className="text-[#667781]">permission{selectionCounter.perms === 1 ? "" : "s"} across</span>
                <span className={selectionCounter.modules > 0 ? "font-extrabold text-[#111B21]" : "text-[#667781]"}>
                  {selectionCounter.modules}
                </span>
                <span className="text-[#667781]">module{selectionCounter.modules === 1 ? "" : "s"}</span>
              </div>
            </Field>
          </div>
        </div>
      </MSection>

      {/* ── Permission picker (modular) ──────────────────────────────── */}
      <MSection title="Permissions by Module">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions or modules..."
            className={INPUT_CLS}
          />

          {/* Quick actions row */}
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#E9EDEF]">
            <button
              type="button"
              onClick={() => {
                const all = new Set<string>();
                for (const m of MODULES) { const keys = moduleKeysById.get(m.id) ?? []; for (const k of keys) all.add(k); }
                setSelected(all);
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer"
            >
              Select All Modules
            </button>
            <button
              type="button"
              onClick={() => {
                const viewOnly = new Set<string>();
                for (const m of MODULES) { const keys = moduleKeysById.get(m.id) ?? []; for (const k of keys) if (isViewOnlyKey(k)) viewOnly.add(k); }
                setSelected(viewOnly);
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer"
            >
              View-Only (All)
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#FFD6D6] bg-white text-[#B00020] hover:bg-[#FFF5F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>

          {/* Module blocks */}
          {MODULES.map((m) => {
            const keys = moduleKeysById.get(m.id) ?? [];
            if (keys.length === 0) return null;
            return (
              <ModulePermissionBlock
                key={m.id}
                module={m}
                permissionKeys={keys}
                selected={selected}
                searchQuery={searchQuery}
                onTogglePermission={handleToggle}
                onBulkReplace={(action) => handleBulkReplace(keys, action)}
                defaultExpanded={false}
              />
            );
          })}
        </div>
      </MSection>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button onClick={handleCreate} disabled={!name.trim() || selected.size === 0 || submitting} className={BTN_PRIMARY}>
          {submitting ? "Creating..." : "Create Role"}
        </button>
      </div>
    </div>
  );
}
