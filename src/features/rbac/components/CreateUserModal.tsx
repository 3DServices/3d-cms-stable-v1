import React, { useEffect, useState } from "react";
import { createUser, getAllRoles } from "../../../api";
import type { RbacRole } from "../../../api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateUserModal({ open, onClose, onCreated }: Props) {
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Admin");
  const [assignedRole, setAssignedRole] = useState("");
  const [billingType, setBillingType] = useState("per_month");

  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles when modal opens
  useEffect(() => {
    if (!open) return;
    setRolesLoading(true);
    getAllRoles("engine")
      .then(res => {
        setRoles(res.data);
        if (res.data.length > 0 && !assignedRole) {
          setAssignedRole(res.data[0].role_name);
        }
      })
      .catch(() => {})
      .finally(() => setRolesLoading(false));
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setAccountName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setAccountType("Admin");
      setAssignedRole("");
      setBillingType("per_month");
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    if (!accountName.trim() || !username.trim() || !email.trim() || !password.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createUser({
        account_name: accountName.trim(),
        username: username.trim(),
        account_type: accountType,
        assigned_role: assignedRole,
        email: email.trim(),
        password,
        root_account: "engine",
        author: "engine",
        billing_type: billingType,
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      setError(err?.apiMessage ?? err?.message ?? "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const canSubmit = accountName.trim() && username.trim() && email.trim() && password.trim() && assignedRole && !submitting;

  return (
    <div className="fixed inset-0 bg-black/35 z-50 grid place-items-center" onClick={onClose}>
      <div className="w-[min(620px,calc(100vw-24px))] max-h-[calc(100vh-24px)] bg-white rounded-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-black text-[15px]">Create User</div>
            <div className="text-[11px] opacity-70">Add a new user account to the system</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25">X</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#EF4444] font-black">{error}</div>
          )}

          <MSection title="Account Details">
            <div className="flex flex-col gap-3">
              <Field label="Full Name" required>
                <input
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Anthony Kiwanuka"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Username" required>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Kiwanukanthony"
                    className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                  />
                </Field>
              </div>
              <Field label="Password" required>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]"
                />
              </Field>
            </div>
          </MSection>

          <MSection title="Role & Billing">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Account Type" required>
                  <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]">
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Customer">Customer</option>
                  </select>
                </Field>
                <Field label="Assigned Role" required>
                  {rolesLoading ? (
                    <div className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#667781] bg-white flex items-center">Loading roles...</div>
                  ) : (
                    <select value={assignedRole} onChange={e => setAssignedRole(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]">
                      {roles.map(r => (
                        <option key={r.role_uid} value={r.role_name}>{r.role_name}</option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
              <Field label="Billing Type" required>
                <select value={billingType} onChange={e => setBillingType(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-[#E9EDEF] text-[12px] text-[#111B21] bg-white outline-none focus:border-[#128C7E]">
                  <option value="per_month">Per Month</option>
                  <option value="per_year">Per Year</option>
                  <option value="per_unit">Per Unit</option>
                  <option value="prepaid">Prepaid</option>
                </select>
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
            {submitting ? "Creating..." : "Create User"}
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
