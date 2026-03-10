
export interface PermissionSet {
  id: string;
  name: string;
  owner: string;
  tenant: string;
  module: string;
  actions: string[];
  rolesUsing: number;
  status: "Active" | "Disabled" | "Draft";
  lastModified: string;
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
  sets: PermissionSet[];
  onSelect: (set: PermissionSet) => void;
  selectedId?: string;
}

export function PermissionSetsTable({ sets, onSelect, selectedId }: Props) {
  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF]">
        <div>
          <div className="font-black text-[13px] text-[#111B21]">Permission Sets</div>
          <div className="text-[11px] text-[#667781] mt-0.5">Grouped permissions bound to modules and blades</div>
        </div>
        <div className="text-[11px] text-[#667781]">{sets.length} sets</div>
      </div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-[12px] min-w-[800px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
              {["ID", "Name", "Owner", "Tenant", "Module", "Actions", "Roles Using", "Status", "Modified"].map(h => (
                <th key={h} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sets.map(s => (
              <tr
                key={s.id}
                onClick={() => onSelect(s)}
                className={`border-b border-[#E9EDEF] last:border-0 cursor-pointer transition-colors ${selectedId === s.id ? "bg-[#EAF7F3]" : "hover:bg-[#F8FAFC]"}`}
              >
                <td className="px-3 py-2.5 font-mono text-[#667781]">{s.id}</td>
                <td className="px-3 py-2.5 font-black text-[#111B21]">{s.name}</td>
                <td className="px-3 py-2.5 text-[#667781]">{s.owner}</td>
                <td className="px-3 py-2.5 text-[#667781]">{s.tenant}</td>
                <td className="px-3 py-2.5 text-[#111B21]">{s.module}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {s.actions.map(a => (
                      <span key={a} className="text-[10px] bg-[#EAF7F3] text-[#128C7E] px-1.5 py-0.5 rounded-full font-black">{a}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[#111B21]">{s.rolesUsing}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stDot[s.status]}`} />
                    <span className={`font-black ${stText[s.status]}`}>{s.status}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[#667781]">{s.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
