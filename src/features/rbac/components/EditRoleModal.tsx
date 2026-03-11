import React, { useEffect, useState } from "react";
import { updateRole, getAllPermissions } from "../../../api";
import type { RbacPermission } from "../../../api";
import type { Role } from "./RolesTable";

interface Props {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditRoleModal({ open, role, onClose, onUpdated }: Props) {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [allPermissions, setAllPermissions] = useState<RbacPermission[]>([]);
  const [selectedPermUids, setSelectedPermUids] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permsLoading, setPermsLoading] = useState(false);

  // Populate form & fetch available permissions when modal opens
  useEffect(() => {
    if (open && role) {
      setRoleName(role.name);
      setRoleDescription("");
      setError(null);
      // Fetch all permissions for the checkboxes
      setPermsLoading(true);
      getAllPermissions("engine")
        .then(res => setAllPermissions(res.data))
        .catch(() => {})
        .finally(() => setPermsLoading(false));
    }
  }, [open, role]);

  function togglePerm(uid: string) {
    setSelectedPermUids(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  async function handleSubmit() {
    if (!role || !roleName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateRole(role.id, {
        role_name: roleName.trim(),
        role_description: roleDescription.trim() || undefined,
        permissions: [...selectedPermUids],
        updated_by: "system",
      });
      onUpdated?.();
      onClose();
    } catch (err: any) {
      setError(err?.apiMessage ?? err?.message ?? "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !role) return null;

  const canSubmit = roleName.trim() && !submitting;

  return (
    <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={onClose}>
      <div className="w-[min(560px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-black text-[15px]">Edit Role</div>
            <div className="text-[11px] opacity-70">Update role details and permissions</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25">X</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#EF4444] font-black">{error}</div>
          )}

          <MSection title="Role Details">
            <div className="flex flex-col gap-3">
              <Field label="Role UID">
                <div className="h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#667781] bg-[#F8FAFC] flex items-center font-mono">{role.id}</div>
              </Field>
              <Field label="Role Name" required>
                <input
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="e.g. Platform Admin"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
              <Field label="Description">
                <input
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  placeholder="e.g. Full access to all platform resources"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
            </div>
          </MSection>

          <MSection title="Permissions">
            {permsLoading ? (
              <div className="text-[12px] text-[#667781]">Loading permissions...</div>
            ) : allPermissions.length === 0 ? (
              <div className="text-[12px] text-[#667781]">No permissions available.</div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allPermissions.map(p => (
                  <label key={p.permission_uid} className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded hover:bg-[#F8FAFC]">
                    <input
                      type="checkbox"
                      checked={selectedPermUids.has(p.permission_uid)}
                      onChange={() => togglePerm(p.permission_uid)}
                      className="accent-[#128C7E]"
                    />
                    <span className="text-[12px] font-black text-[#111B21]">{p.permission_name}</span>
                    <span className="text-[10px] text-[#667781]">({p.permission_module})</span>
                  </label>
                ))}
              </div>
            )}
          </MSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E9EDEF] bg-white shrink-0">
          <button onClick={onClose} className="h-10 px-5 rounded-lg bg-white border border-[#E9EDEF] text-[13px] font-black text-[#111B21] cursor-pointer">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-10 px-6 rounded-lg bg-[#128C7E] text-white text-[13px] font-black border-none cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Changes"}
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
