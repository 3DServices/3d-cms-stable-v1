import { useEffect, useState } from "react";
import { getAllRoles, setUserAction, adminResetPassword, assignUserRole } from "../../../api";
import type { RbacRole } from "../../../api";
import { useAuth } from "../../../auth/AuthContext";
import { PermissionGate } from "../../../auth/PermissionGate";
import type { UserRow } from "./UsersTable";

interface Props {
  user: UserRow;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserDetailBlade({ user, onClose, onUserUpdated }: Props) {
  const { state: { accountUid } } = useAuth();

  // ── Role change state ────────────────────────────────────────────────────
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showRoleChanger, setShowRoleChanger] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roleChanging, setRoleChanging] = useState(false);

  // ── Block/Unblock state ──────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);

  // ── Reset password state ─────────────────────────────────────────────────
  const [showResetPw, setShowResetPw] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwResetting, setPwResetting] = useState(false);

  // ── Deactivate state ────────────────────────────────────────────────────
  const [deactivating, setDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  // ── Feedback ─────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Fetch roles on mount
  useEffect(() => {
    setRolesLoading(true);
    getAllRoles("engine")
      .then((res) => setRoles(res.data))
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  }, []);

  const isClient = user.account_type === "client" || user.account_type === "Customer";
  const isActive = user.access_status === "active";

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleToggleStatus() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const nextAction = isActive ? "locked" : "active";
      await setUserAction(user.account_uid, nextAction);
      setFeedback({ type: "success", msg: `User ${isActive ? "blocked" : "unblocked"} successfully.` });
      onUserUpdated();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.apiMessage ?? err?.message ?? "Action failed" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleChangeRole() {
    if (!newRole) return;
    setRoleChanging(true);
    setFeedback(null);
    try {
      await assignUserRole(user.account_uid, {
        role_name: newRole,
        updated_by: accountUid ?? "system",
      });
      setFeedback({ type: "success", msg: `Role changed to "${newRole}" successfully.` });
      setShowRoleChanger(false);
      onUserUpdated();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.apiMessage ?? err?.message ?? "Failed to change role" });
    } finally {
      setRoleChanging(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword.trim() || newPassword.length < 6) return;
    setPwResetting(true);
    setFeedback(null);
    try {
      await adminResetPassword(user.account_uid, newPassword.trim());
      setFeedback({ type: "success", msg: "Password reset successfully." });
      setShowResetPw(false);
      setNewPassword("");
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.apiMessage ?? err?.message ?? "Failed to reset password" });
    } finally {
      setPwResetting(false);
    }
  }

  async function handleDeactivateUser() {
    setDeactivating(true);
    setFeedback(null);
    try {
      await setUserAction(user.account_uid, "deactivated");
      setFeedback({ type: "success", msg: "User deactivated successfully." });
      setConfirmDeactivate(false);
      onUserUpdated();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.apiMessage ?? err?.message ?? "Failed to deactivate user" });
    } finally {
      setDeactivating(false);
    }
  }

  const isDeactivated = user.access_status === "deactivated";

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <aside className="w-[380px] shrink-0 h-full border-l border-[#E9EDEF] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <div className="font-black text-[14px] truncate">{user.account_name}</div>
          <div className="text-[11px] opacity-70 truncate">@{user.username}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/15 text-white font-black text-[13px] border-none cursor-pointer grid place-items-center hover:bg-white/25"
        >
          X
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 flex flex-col gap-3">

        {/* Feedback banner */}
        {feedback && (
          <div className={`px-3 py-2 rounded-lg text-[11px] font-black ${
            feedback.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Profile card */}
        <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3 flex flex-col gap-2">
          <div className="text-[11px] font-black text-[#667781] uppercase tracking-wide">Profile</div>
          <InfoRow label="Full Name" value={user.account_name} />
          <InfoRow label="Username" value={user.username} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="UID" value={user.account_uid} mono />
          <InfoRow label="Created" value={user.date_created ? new Date(user.date_created).toLocaleDateString() : "--"} />
        </div>

        {/* Account card */}
        <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3 flex flex-col gap-2">
          <div className="text-[11px] font-black text-[#667781] uppercase tracking-wide">Account</div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#667781]">Type</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
              isClient ? "bg-[#EAF7F3] text-[#075E54]" : "bg-[#EBF5FF] text-[#1D4ED8]"
            }`}>
              {isClient ? "Oliwa (Client)" : "CMS (Inhouse)"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#667781]">Status</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
              isActive ? "bg-[#ECFDF5] text-[#059669]" : isDeactivated ? "bg-[#F5F5F5] text-[#9CA3AF]" : "bg-[#FEF2F2] text-[#DC2626]"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#10B981]" : isDeactivated ? "bg-[#9CA3AF]" : "bg-[#EF4444]"}`} />
              {isActive ? "Active" : isDeactivated ? "Deactivated" : "Locked"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#667781]">Role</span>
            <span className="bg-[#F0F2F5] px-2 py-0.5 rounded-full text-[10px] font-black text-[#111B21]">
              {user.account_role}
            </span>
          </div>
          {user.billing_type && (
            <InfoRow label="Billing" value={user.billing_type} />
          )}
          {isClient && user.primary_account_name && (
            <InfoRow label="Organisation" value={user.primary_account_name} />
          )}
          {isClient && (
            <InfoRow label="Account Root" value={user.primary_account} mono />
          )}
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="bg-[#F8FAFC] border border-[#E9EDEF] rounded-xl p-3 flex flex-col gap-2">
          <div className="text-[11px] font-black text-[#667781] uppercase tracking-wide">Actions</div>

          {/* Change Role */}
          <PermissionGate permission="rbac.manage">
            {!showRoleChanger ? (
              <ActionBtn label="Change Role" onClick={() => { setShowRoleChanger(true); setNewRole(user.account_role); }} />
            ) : (
              <div className="flex flex-col gap-2 p-2 rounded-lg border border-[#E9EDEF] bg-white">
                <div className="text-[11px] font-black text-[#111B21]">Assign new role</div>
                {rolesLoading ? (
                  <div className="text-[11px] text-[#667781]">Loading roles...</div>
                ) : (
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="h-8 px-2 rounded-md border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.role_uid} value={r.role_name}>{r.role_name}</option>
                    ))}
                  </select>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangeRole}
                    disabled={roleChanging || !newRole || newRole === user.account_role}
                    className="flex-1 h-7 rounded-md bg-[#128C7E] text-white text-[11px] font-black border-none cursor-pointer hover:bg-[#0D7466] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {roleChanging ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setShowRoleChanger(false)}
                    className="h-7 px-3 rounded-md border border-[#E9EDEF] bg-white text-[11px] text-[#667781] cursor-pointer hover:bg-[#F0F2F5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </PermissionGate>

          {/* Block / Unblock */}
          <PermissionGate permission="users.edit">
            <ActionBtn
              label={isActive ? "Block User" : "Unblock User"}
              danger={isActive}
              loading={actionLoading}
              onClick={handleToggleStatus}
            />
          </PermissionGate>

          {/* Reset Password */}
          <PermissionGate permission="users.reset_password">
            {!showResetPw ? (
              <ActionBtn label="Reset Password" onClick={() => setShowResetPw(true)} />
            ) : (
              <div className="flex flex-col gap-2 p-2 rounded-lg border border-[#E9EDEF] bg-white">
                <div className="text-[11px] font-black text-[#111B21]">Set new password</div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="h-8 px-2 rounded-md border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleResetPassword}
                    disabled={pwResetting || newPassword.trim().length < 6}
                    className="flex-1 h-7 rounded-md bg-[#128C7E] text-white text-[11px] font-black border-none cursor-pointer hover:bg-[#0D7466] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pwResetting ? "Resetting..." : "Reset"}
                  </button>
                  <button
                    onClick={() => { setShowResetPw(false); setNewPassword(""); }}
                    className="h-7 px-3 rounded-md border border-[#E9EDEF] bg-white text-[11px] text-[#667781] cursor-pointer hover:bg-[#F0F2F5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </PermissionGate>

          {/* Deactivate / Delete User */}
          <PermissionGate permission="users.delete">
            {isDeactivated ? (
              <div className="px-3 py-2 rounded-lg bg-[#F0F2F5] text-[11px] text-[#667781] font-black text-center">
                This user is already deactivated
              </div>
            ) : !confirmDeactivate ? (
              <ActionBtn label="Deactivate User" danger onClick={() => setConfirmDeactivate(true)} />
            ) : (
              <div className="flex flex-col gap-2 p-2 rounded-lg border border-[#FFD6D6] bg-[#FFF5F5]">
                <div className="text-[11px] font-black text-[#B00020]">
                  Are you sure? This will deactivate the user account. They will no longer be able to log in.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeactivateUser}
                    disabled={deactivating}
                    className="flex-1 h-7 rounded-md bg-[#B00020] text-white text-[11px] font-black border-none cursor-pointer hover:bg-[#8C001A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deactivating ? "Deactivating..." : "Yes, Deactivate"}
                  </button>
                  <button
                    onClick={() => setConfirmDeactivate(false)}
                    className="h-7 px-3 rounded-md border border-[#E9EDEF] bg-white text-[11px] text-[#667781] cursor-pointer hover:bg-[#F0F2F5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </PermissionGate>
        </div>
      </div>
    </aside>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-[#667781] shrink-0">{label}</span>
      <span className={`text-[11px] text-[#111B21] text-right truncate ${mono ? "font-mono text-[10px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ActionBtn({ label, onClick, danger, loading }: { label: string; onClick: () => void; danger?: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full h-8 rounded-lg text-[11px] font-black border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? "border-[#FFD6D6] bg-white text-[#B00020] hover:bg-[#FFF5F5]"
          : "border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5]"
      }`}
    >
      {loading ? "Processing..." : label}
    </button>
  );
}
