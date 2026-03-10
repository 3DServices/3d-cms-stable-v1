
export interface Role {
  id: string;
  name: string;
  owner: string;
  tenant: string;
  scope: string;
  users: number;
  permissions: number;
  status: "Active" | "Disabled" | "Draft";
  lastModified: string;
  tags: string[];
}

const stDot: Record<string, string> = {
  Active:   "bg-[#25D366]",
  Disabled: "bg-[#EF4444]",
  Draft:    "bg-[#FBBF24]",
};

const stText: Record<string, string> = {
  Active:   "text-[#1A7A3A]",
  Disabled: "text-[#EF4444]",
  Draft:    "text-[#F97316]",
};

interface Props {
  roles: Role[];
  onSelect: (role: Role) => void;
  selectedId?: string;
}

export function RolesTable({ roles, onSelect, selectedId }: Props) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF]">
        <div>
          <div className="font-black text-[13px] text-[#111B21]">Roles</div>
          <div className="text-[11px] text-[#667781] mt-0.5">Define access levels and responsibilities across tenants</div>
        </div>
        <div className="text-[11px] text-[#667781]">{roles.length} roles</div>
      </div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-[12px] min-w-[900px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
              {["ID", "Name", "Owner", "Tenant", "Scope", "Users", "Permissions", "Status", "Modified", "Tags"].map(h => (
                <th key={h} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr
                key={r.id}
                onClick={() => onSelect(r)}
                className={`border-b border-[#E9EDEF] last:border-0 cursor-pointer transition-colors ${selectedId === r.id ? "bg-[#EAF7F3]" : "hover:bg-[#F8FAFC]"}`}
              >
                <td className="px-3 py-2.5 font-mono text-[#667781]">{r.id}</td>
                <td className="px-3 py-2.5 font-black text-[#111B21]">{r.name}</td>
                <td className="px-3 py-2.5 text-[#667781]">{r.owner}</td>
                <td className="px-3 py-2.5 text-[#667781]">{r.tenant}</td>
                <td className="px-3 py-2.5 text-[#667781]">{r.scope}</td>
                <td className="px-3 py-2.5 text-[#111B21]">{r.users}</td>
                <td className="px-3 py-2.5 text-[#111B21]">{r.permissions}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stDot[r.status]}`} />
                    <span className={`font-black ${stText[r.status]}`}>{r.status}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#667781]">{r.lastModified}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {r.tags.map(t => (
                      <span key={t} className="text-[10px] bg-[#F0F2F5] text-[#667781] px-1.5 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
