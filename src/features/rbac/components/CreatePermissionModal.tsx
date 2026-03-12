import React, { useEffect, useState } from "react";
import { createPermission, getAllPermissions } from "../../../api";
import type { RbacPermission } from "../../../api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const DEFAULT_MODULES = ["billing", "gps", "alerts", "tokens", "rbac", "tenants", "devices", "veba", "noc", "reports"];

export function CreatePermissionModal({ open, onClose, onCreated }: Props) {
  const [permissionName, setPermissionName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [customModule, setCustomModule] = useState("");

  const [modules, setModules] = useState<string[]>(DEFAULT_MODULES);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing modules from permissions on open
  useEffect(() => {
    if (!open) return;
    setModulesLoading(true);
    getAllPermissions("engine")
      .then((res) => {
        const existing = new Set<string>();
        (res.data as RbacPermission[]).forEach((p) => {
          if (p.permission_module) existing.add(p.permission_module.toLowerCase());
        });
        // Merge defaults with any new modules from DB
        DEFAULT_MODULES.forEach((m) => existing.add(m));
        setModules([...existing].sort());
      })
      .catch(() => setModules(DEFAULT_MODULES))
      .finally(() => setModulesLoading(false));
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPermissionName("");
      setDescription("");
      setSelectedModules(new Set());
      setCustomModule("");
      setError(null);
    }
  }, [open]);

  function toggleModule(mod: string) {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  }

  function toggleAll() {
    if (selectedModules.size === modules.length) {
      setSelectedModules(new Set());
    } else {
      setSelectedModules(new Set(modules));
    }
  }

  // Build the list of modules to create permissions for
  const activeModules = [...selectedModules];
  if (customModule.trim() && !selectedModules.has(customModule.trim().toLowerCase())) {
    activeModules.push(customModule.trim().toLowerCase());
  }

  async function handleSubmit() {
    if (!permissionName.trim() || !description.trim() || activeModules.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      // Create one permission per selected module
      const results = await Promise.allSettled(
        activeModules.map((mod) =>
          createPermission({
            permission_name: `${mod}.${permissionName.trim()}`,
            permission_description: description.trim(),
            permission_module: mod,
            account_root: "engine",
            created_by: "system",
          })
        )
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0 && failures.length < results.length) {
        setError(`${results.length - failures.length} created, ${failures.length} failed`);
      } else if (failures.length === results.length) {
        const first = failures[0] as PromiseRejectedResult;
        throw first.reason;
      }
      onCreated?.();
      if (failures.length === 0) onClose();
    } catch (err: any) {
      setError(err?.apiMessage ?? err?.message ?? "Failed to create permission");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const allSelected = modules.length > 0 && selectedModules.size === modules.length;
  const canSubmit = permissionName.trim() && description.trim() && activeModules.length > 0 && !submitting;

  return (
    <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={onClose}>
      <div className="w-[min(560px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-black text-[15px]">Create Permission</div>
            <div className="text-[11px] opacity-70">Define a new permission for a module</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25">X</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#EF4444] font-black">{error}</div>
          )}

          {/* Module Selection */}
          <MSection title={`1. Select Modules (${activeModules.length} selected)`}>
            {modulesLoading ? (
              <div className="text-[12px] text-[#667781]">Loading modules...</div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Select All */}
                <label className="flex items-center gap-2.5 text-[12px] cursor-pointer pb-2 border-b border-[#E9EDEF]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#128C7E]"
                  />
                  <span className="font-black text-[#128C7E]">Select All</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-[12px] ${
                        selectedModules.has(m)
                          ? "bg-[#EAF7F3] border border-[#128C7E] text-[#075E54] font-black"
                          : "bg-white border border-[#E9EDEF] hover:bg-[#F8FAFC] text-[#111B21]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.has(m)}
                        onChange={() => toggleModule(m)}
                        className="w-4 h-4 accent-[#128C7E]"
                      />
                      {m}
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#E9EDEF]">
                  <span className="text-[11px] text-[#667781] font-black shrink-0">Custom:</span>
                  <input
                    value={customModule}
                    onChange={(e) => setCustomModule(e.target.value)}
                    placeholder="Enter a new module name..."
                    className="flex-1 h-8 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                  />
                </div>
              </div>
            )}
          </MSection>

          {/* Permission Details */}
          <MSection title="2. Permission Details">
            <div className="flex flex-col gap-3">
              <Field label="Action Name" required>
                <input
                  value={permissionName}
                  onChange={e => setPermissionName(e.target.value)}
                  placeholder="e.g. view, manage, create, delete"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
                <div className="text-[10px] text-[#667781] mt-1">
                  Will create: {activeModules.length > 0
                    ? activeModules.map((m) => `${m}.${permissionName.trim() || "action"}`).join(", ")
                    : "Select modules above"}
                </div>
              </Field>
              <Field label="Description" required>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. View billing records and invoices"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
            </div>
          </MSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E9EDEF] bg-white shrink-0">
          <button onClick={onClose} className="h-10 px-5 rounded-lg bg-white border border-[#E9EDEF] text-[13px] font-black text-[#111B21] cursor-pointer">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-10 px-6 rounded-lg bg-[#25D366] text-[#075E54] text-[13px] font-black border-none cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Permission"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Local helpers ────────────────────────────────────────────────────────────
function MSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 border border-[#E9EDEF] rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF]"><div className="font-black text-[13px] text-[#111B21]">{title}</div></div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-black text-[#111B21] mb-1">{label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}</div>
      {children}
    </div>
  );
}
