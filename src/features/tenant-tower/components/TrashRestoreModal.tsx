/**
 * TrashRestoreModal — Client Trash & Restore overlay.
 *
 * Shows soft-deleted clients with restore action.
 * 30-day retention, then permanent purge.
 */
import React, { useEffect, useState } from "react";
import { getTrashedClients, restoreClient, ApiError } from "../../../api";
import type { TrashedClient } from "../../../api";

interface TrashRestoreModalProps {
  open:    boolean;
  onClose: () => void;
  onRestored?: () => void;
}

export function TrashRestoreModal({ open, onClose, onRestored }: TrashRestoreModalProps) {
  const [items, setItems]       = useState<TrashedClient[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getTrashedClients()
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (err instanceof ApiError) setError(err.apiMessage ?? err.message);
      })
      .finally(() => setLoading(false));
  }, [open]);

  async function handleRestore(clientUid: string) {
    setRestoring(clientUid);
    try {
      await restoreClient(clientUid);
      setItems((prev) => prev.filter((c) => c.client_uid !== clientUid));
      onRestored?.();
    } catch (err) {
      if (err instanceof ApiError) setError(err.apiMessage ?? err.message);
    } finally {
      setRestoring(null);
    }
  }

  function ageLabel(deletedAt: string): string {
    const diff = Date.now() - new Date(deletedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "<1d";
    return `${days}d`;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] shrink-0">
          <div>
            <div className="font-black text-[14px] text-[#111B21]">Trash &amp; Restore</div>
            <div className="text-[11px] text-[#667781] mt-0.5">Soft-deleted clients retained 30 days before permanent purge.</div>
          </div>
          <button onClick={onClose} className="text-[11px] text-[#667781] bg-[#F0F2F5] border border-[#E9EDEF] rounded-lg px-3 py-1.5 cursor-pointer font-black hover:bg-[#E9EDEF]">Close</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {error && (
            <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-[#FEF2F2] text-[12px] text-[#EF4444] font-black">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-[12px] text-[#667781]">Loading trashed clients...</div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[12px] text-[#667781]">No trashed clients.</div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E9EDEF] bg-[#F8FAFC]">
                  {["Client", "Email", "Deleted By", "Age", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-[11px] font-extrabold text-[#667781]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.client_uid} className="border-b border-[#E9EDEF] last:border-0 hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-extrabold text-[#111B21]">{c.client_name}</td>
                    <td className="px-5 py-3 text-[#667781]">{c.client_email}</td>
                    <td className="px-5 py-3 text-[#667781]">{c.deleted_by}</td>
                    <td className="px-5 py-3 text-[#667781]">{ageLabel(c.deleted_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        disabled={restoring === c.client_uid}
                        onClick={() => handleRestore(c.client_uid)}
                        className="h-7 px-3 rounded-full text-[10px] font-black border-none cursor-pointer transition-all bg-[#F0F2F5] text-[#111B21] hover:bg-[#E9EDEF] disabled:opacity-50"
                      >
                        {restoring === c.client_uid ? "Restoring..." : "Restore"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E9EDEF] shrink-0 text-[11px] text-[#667781]">
          Permanent purge after 30 days. All restores are audit-logged.
        </div>
      </div>
    </div>
  );
}
