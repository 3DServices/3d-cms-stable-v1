import React, { useEffect, useState } from "react";
import { getRoleByUid, deleteRole } from "../../../api";
import type { RbacPermission } from "../../../api";
import type { Role } from "./RolesTable";

const TABS = ["Overview", "Permissions", "Audit"];

interface Props {
  role: Role;
  onClose: () => void;
  onEdit: (role: Role) => void;
  onDisabled?: () => void;
}

export function RbacDetailBlade({ role, onClose, onEdit, onDisabled }: Props) {
  const [tab, setTab] = useState("Overview");
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);

  // Fetch role detail (with permissions) when role changes
  useEffect(() => {
    setPermsLoading(true);
    getRoleByUid(role.id)
      .then(res => setPermissions(res.data.permissions ?? []))
      .catch(() => setPermissions([]))
      .finally(() => setPermsLoading(false));
  }, [role.id]);

  async function handleDisable() {
    if (!confirm(`Disable role "${role.name}"? This will soft-delete the role.`)) return;
    setDisabling(true);
    try {
      await deleteRole(role.id, { deleted_by: "system" });
      onDisabled?.();
      onClose();
    } catch {
      alert("Failed to disable role.");
    } finally {
      setDisabling(false);
    }
  }

  return (
    <div className="w-[420px] h-full shrink-0 bg-white border-l border-[#E9EDEF] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E9EDEF] shrink-0">
        <div>
          <div className="font-black text-[14px] text-[#111B21]">{role.name}</div>
          <div className="text-[11px] text-[#667781]">{role.id}</div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#F0F2F5] border border-[#E9EDEF] text-[#667781] font-black text-[13px] cursor-pointer grid place-items-center hover:bg-[#E9EDEF]">X</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-5 py-2.5 border-b border-[#E9EDEF] shrink-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`h-8 px-3 rounded-full text-[11px] font-black border-none cursor-pointer transition-all ${tab === t ? "bg-[#128C7E] text-white" : "bg-[#F0F2F5] text-[#667781] hover:bg-[#E9EDEF]"}`}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-5 py-4">

        {tab === "Overview" && (<>
          <BSection title="Role Details">
            <div className="p-4">
              <KV rows={[
                { k: "Name:", v: role.name },
                { k: "ID:", v: role.id },
                { k: "Owner:", v: role.owner },
                { k: "Tenant:", v: role.tenant },
                { k: "Modified:", v: role.lastModified },
              ]} />
            </div>
          </BSection>
          <BSection title="Usage Summary">
            <div className="p-4">
              <KV rows={[
                { k: "Users:", v: String(role.users) },
                { k: "Perms:", v: permsLoading ? "..." : String(permissions.length) },
              ]} />
            </div>
          </BSection>
        </>)}

        {tab === "Permissions" && (
          <BSection title="Bound Permission Sets">
            <div className="p-4">
              {permsLoading ? (
                <div className="text-[12px] text-[#667781]">Loading permissions...</div>
              ) : permissions.length === 0 ? (
                <div className="text-[12px] text-[#667781]">No permissions assigned to this role.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {permissions.map(p => (
                    <div key={p.permission_uid} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#128C7E]" />
                      <div className="flex flex-col">
                        <span className="font-black text-[12px] text-[#111B21]">{p.permission_name}</span>
                        <span className="text-[10px] text-[#667781]">{p.permission_module} &mdash; {p.permission_description || "No description"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BSection>
        )}

        {tab === "Audit" && (
          <BSection title="Audit Trail">
            <div className="p-4 flex flex-col gap-3">
              {[
                { ts: "2026-03-10 14:22:01", op: "UPDATE", field: "permissions", old: "3", new: "5", user: "admin@navas.io", ticket: "CHG-4421" },
                { ts: "2026-03-09 09:11:45", op: "UPDATE", field: "scope", old: "Tenant", new: "Platform", user: "ops@navas.io", ticket: "CHG-4418" },
                { ts: "2026-03-07 16:05:33", op: "CREATE", field: "-", old: "-", new: "-", user: "admin@navas.io", ticket: "CHG-4410" },
              ].map((a, i) => (
                <div key={i} className="border border-[#E9EDEF] rounded-lg p-3 bg-[#F8FAFC]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${a.op === "CREATE" ? "bg-[#EAF7F3] text-[#128C7E]" : "bg-[#FFF7ED] text-[#F97316]"}`}>{a.op}</span>
                    <span className="text-[11px] text-[#667781]">{a.ts}</span>
                  </div>
                  <div className="text-[11px] text-[#667781]">
                    {a.op === "CREATE"
                      ? <span>Role created by <span className="font-black text-[#111B21]">{a.user}</span></span>
                      : <span>Field <span className="font-black text-[#111B21]">{a.field}</span>: {a.old} &rarr; {a.new} by <span className="font-black text-[#111B21]">{a.user}</span></span>
                    }
                  </div>
                  <div className="text-[10px] text-[#128C7E] mt-1">Ticket: {a.ticket}</div>
                </div>
              ))}
            </div>
          </BSection>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-[#E9EDEF] shrink-0">
        <button onClick={() => onEdit(role)} className="h-8 px-4 rounded-lg bg-[#128C7E] text-white text-[11px] font-black border-none cursor-pointer hover:brightness-105">Edit Role</button>
        <button
          onClick={handleDisable}
          disabled={disabling}
          className="h-8 px-4 rounded-lg bg-white border border-[#EF4444] text-[#EF4444] text-[11px] font-black cursor-pointer hover:bg-[#FEF2F2] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabling ? "Disabling..." : "Disable"}
        </button>
      </div>
    </div>
  );
}

// ── Local helpers ────────────────────────────────────────────────────────────
function BSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 border border-[#E9EDEF] rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E9EDEF]"><div className="font-black text-[12px] text-[#111B21]">{title}</div></div>
      {children}
    </div>
  );
}

function KV({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(r => (
        <div key={r.k} className="flex gap-3 text-[12px]">
          <span className="text-[#667781] w-[80px] shrink-0">{r.k}</span>
          <span className="font-black text-[#111B21]">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
