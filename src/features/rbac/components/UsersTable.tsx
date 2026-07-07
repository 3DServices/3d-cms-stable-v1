import { useState } from "react";

export interface UserRow {
  account_uid: string;
  account_name: string;
  username: string;
  email: string;
  account_type: string;
  account_role: string;
  access_status: string;
  primary_account: string;
  primary_account_name?: string;
  date_created: string;
  billing_type?: string;
  token_balance?: number;
}

interface Props {
  users: UserRow[];
  onSelect: (user: UserRow) => void;
  selectedId?: string;
  roles: string[];
}

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  Inhouse:  { bg: "bg-[#EBF5FF]", text: "text-[#1D4ED8]", label: "CMS" },
  client:   { bg: "bg-[#EAF7F3]", text: "text-[#075E54]", label: "Oliwa" },
  Customer: { bg: "bg-[#EAF7F3]", text: "text-[#075E54]", label: "Oliwa" },
};

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  active:      { bg: "bg-[#ECFDF5]", text: "text-[#059669]", dot: "bg-[#10B981]" },
  locked:      { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#EF4444]" },
  deactivated: { bg: "bg-[#F5F5F5]", text: "text-[#9CA3AF]", dot: "bg-[#9CA3AF]" },
};

export function UsersTable({ users, onSelect, selectedId, roles }: Props) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = users.filter((u) => {
    if (typeFilter !== "all") {
      const isClient = u.account_type === "client" || u.account_type === "Customer";
      if (typeFilter === "client" && !isClient) return false;
      if (typeFilter === "Inhouse" && isClient) return false;
    }
    if (statusFilter !== "all" && u.access_status !== statusFilter) return false;
    if (roleFilter !== "all" && u.account_role !== roleFilter) return false;
    return true;
  });

  const uniqueRoles = roles.length > 0 ? roles : [...new Set(users.map((u) => u.account_role).filter(Boolean))];

  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
      {/* Header + Filters */}
      <div className="px-4 py-3 border-b border-[#E9EDEF]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-black text-[13px] text-[#111B21]">Users</div>
            <div className="text-[11px] text-[#667781] mt-0.5">
              CMS (Inhouse) and Oliwa (Client) user accounts
            </div>
          </div>
          <div className="text-[11px] text-[#667781]">
            {filtered.length} of {users.length} users
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-7 px-2 rounded-md border border-[#E9EDEF] text-[11px] text-[#111B21] bg-white outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Inhouse">CMS (Inhouse)</option>
            <option value="client">Oliwa (Client)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 px-2 rounded-md border border-[#E9EDEF] text-[11px] text-[#111B21] bg-white outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-7 px-2 rounded-md border border-[#E9EDEF] text-[11px] text-[#111B21] bg-white outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.sort().map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {(typeFilter !== "all" || statusFilter !== "all" || roleFilter !== "all") && (
            <button
              onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setRoleFilter("all"); }}
              className="h-7 px-2 rounded-md border border-[#FFD6D6] text-[11px] text-[#B00020] bg-white cursor-pointer hover:bg-[#FFF5F5]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-[12px] min-w-[900px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E9EDEF]">
              {["Name", "Username", "Email", "Type", "Role", "Status", "Created"].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-black text-[#667781]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#667781]">
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const typeBadge = TYPE_BADGE[u.account_type] ?? { bg: "bg-[#F0F2F5]", text: "text-[#667781]", label: u.account_type };
                const statusBadge = STATUS_BADGE[u.access_status] ?? { bg: "bg-[#F0F2F5]", text: "text-[#667781]", dot: "bg-[#667781]" };

                return (
                  <tr
                    key={u.account_uid}
                    onClick={() => onSelect(u)}
                    className={`border-b border-[#E9EDEF] last:border-0 cursor-pointer transition-colors ${
                      selectedId === u.account_uid ? "bg-[#EAF7F3]" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <td className="px-3 py-2.5 font-black text-[#111B21]">{u.account_name}</td>
                    <td className="px-3 py-2.5 text-[#667781]">{u.username}</td>
                    <td className="px-3 py-2.5 text-[#667781]">{u.email}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${typeBadge.bg} ${typeBadge.text}`}>
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="bg-[#F0F2F5] px-2 py-0.5 rounded-full text-[10px] font-black text-[#111B21]">
                        {u.account_role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${statusBadge.bg} ${statusBadge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {u.access_status === "active" ? "Active" : u.access_status === "deactivated" ? "Deactivated" : "Locked"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#667781]">
                      {u.date_created ? new Date(u.date_created).toLocaleDateString() : "--"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
