import React, { useEffect, useState } from "react";
import { getAllPermissions, createRole } from "../../../api";
import type { RbacPermission } from "../../../api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateRoleModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("Tenant");
  const [tenant, setTenant] = useState("engine");

  // Permissions from API
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);

  // Fetch permissions when modal opens
  useEffect(() => {
    if (!open) return;
    setPermsLoading(true);
    getAllPermissions("engine")
      .then(res => setPermissions(res.data))
      .catch(() => {})
      .finally(() => setPermsLoading(false));
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setScope("Tenant");
      setTenant("engine");
      setSelectedPerms(new Set());
    }
  }, [open]);

  function togglePerm(uid: string) {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function toggleAll() {
    if (selectedPerms.size === permissions.length) {
      setSelectedPerms(new Set());
    } else {
      setSelectedPerms(new Set(permissions.map(p => p.permission_uid)));
    }
  }

  async function handleAssign() {
    if (!name.trim() || selectedPerms.size === 0) return;
    setSubmitting(true);
    try {
      await createRole({
        role_name: name.trim(),
        role_description: description.trim(),
        account_root: tenant,
        created_by: "current_user",
        permissions: Array.from(selectedPerms),
      });
      onClose();
    } catch {
      // error handling can be added later
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  // Group permissions by module
  const byModule = permissions.reduce<Record<string, RbacPermission[]>>((acc, p) => {
    const mod = p.permission_module;
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const allSelected = permissions.length > 0 && selectedPerms.size === permissions.length;

  return (
    <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={onClose}>
      <div className="w-[min(720px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-black text-[15px]">Create Role</div>
            <div className="text-[11px] opacity-70">Define a new role and assign permissions</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25">X</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
          <MSection title="Role Details">
            <div className="flex flex-col gap-3">
              <Field label="Role Name" required>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. fleet_manager"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
              <Field label="Role Description">
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this role's purpose"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Scope" required>
                  <select value={scope} onChange={e => setScope(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]">
                    <option>Platform</option>
                    <option>Tenant</option>
                    <option>Customer</option>
                    <option>Dealer</option>
                  </select>
                </Field>
                <Field label="Account Root" required>
                  <select value={tenant} onChange={e => setTenant(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]">
                    <option value="engine">engine</option>
                  </select>
                </Field>
              </div>
            </div>
          </MSection>

          <MSection title={`Permissions (${selectedPerms.size} of ${permissions.length} selected)`}>
            {permsLoading ? (
              <div className="text-[12px] text-[#667781] text-center py-4">Loading permissions...</div>
            ) : permissions.length === 0 ? (
              <div className="text-[12px] text-[#667781] text-center py-4">No permissions found</div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Select all */}
                <label className="flex items-center gap-2.5 text-[12px] cursor-pointer pb-2 border-b border-[#E9EDEF]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#128C7E]"
                  />
                  <span className="font-black text-[#128C7E]">Select All</span>
                </label>

                {/* Grouped by module */}
                {Object.entries(byModule).map(([mod, perms]) => (
                  <div key={mod}>
                    <div className="text-[11px] font-black text-[#667781] uppercase mb-1.5">{mod}</div>
                    <div className="flex flex-col gap-1.5 pl-1">
                      {perms.map(p => (
                        <label key={p.permission_uid} className="flex items-center gap-2.5 text-[12px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPerms.has(p.permission_uid)}
                            onChange={() => togglePerm(p.permission_uid)}
                            className="w-4 h-4 accent-[#128C7E]"
                          />
                          <span className="font-black text-[#111B21]">{p.permission_name}</span>
                          <span className="text-[#667781] text-[11px]">{p.permission_description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E9EDEF] bg-white shrink-0">
          <button onClick={onClose} className="h-10 px-5 rounded-lg bg-white border border-[#E9EDEF] text-[13px] font-black text-[#111B21] cursor-pointer">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={!name.trim() || selectedPerms.size === 0 || submitting}
            className="h-10 px-6 rounded-lg bg-[#25D366] text-[#075E54] text-[13px] font-black border-none cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Assigning..." : "Assign Role"}
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
