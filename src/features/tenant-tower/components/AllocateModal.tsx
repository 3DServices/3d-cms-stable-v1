import React, { useState } from "react";
import { transferTokens, getAllClients } from "../../../api";
import type { Client } from "../../../api";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  fromClientUid: string | null;
  fromClientName: string;
  onSuccess: () => void;
}

export function AllocateModal({ open, onClose, fromClientUid, fromClientName, onSuccess }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [toClientUid, setToClientUid] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ from_new_balance: number; to_new_balance: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    getAllClients()
      .then((res) => setClients(res.data.filter((c) => c.client_uid !== fromClientUid)))
      .catch(() => {});
  }, [open, fromClientUid]);

  if (!open) return null;

  function reset() {
    setToClientUid("");
    setAmount("");
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!fromClientUid) return;
    if (!toClientUid) { setError("Select a recipient client"); return; }
    const num = Number(amount);
    if (!num || num <= 0) { setError("Enter a positive token amount"); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await transferTokens({
        from_client_uid: fromClientUid,
        to_client_uid: toClientUid,
        amount: num,
      });
      setResult({ from_new_balance: res.data.from_new_balance, to_new_balance: res.data.to_new_balance });
      onSuccess();
    } catch (e: any) {
      setError(e?.message ?? "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-110 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E9EDEF]">
          <span className="font-black text-[14px] text-[#111B21]">Transfer Tokens</span>
          <button onClick={handleClose} className="text-[11px] text-[#667781] bg-[#F0F2F5] border border-[#E9EDEF] rounded-lg px-3 py-1.5 cursor-pointer font-black hover:bg-[#E9EDEF]">Close</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="text-[12px] text-[#667781] mb-3">
            Transfer tokens from <span className="font-black text-[#111B21]">{fromClientName}</span> to another client
          </div>

          {result ? (
            <div className="bg-[#EAF7F3] border border-[#25D366] rounded-xl p-4 text-center">
              <div className="text-[14px] font-black text-[#128C7E]">Transfer Successful</div>
              <div className="text-[12px] text-[#667781] mt-1">
                {fromClientName} balance: <span className="font-black text-[#111B21]">{result.from_new_balance.toLocaleString()}</span>
              </div>
              <div className="text-[12px] text-[#667781] mt-0.5">
                Recipient balance: <span className="font-black text-[#111B21]">{result.to_new_balance.toLocaleString()}</span>
              </div>
              <button onClick={handleClose} className="mt-3 h-8 px-4 rounded-full text-[11px] font-black bg-[#128C7E] text-white border-none cursor-pointer">Done</button>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-[10px] font-black text-[#667781] block mb-1">Recipient Client</label>
                <select
                  value={toClientUid}
                  onChange={(e) => setToClientUid(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] font-black text-[#111B21] outline-none focus:border-[#128C7E]"
                >
                  <option value="">— select client —</option>
                  {clients.map((c) => (
                    <option key={c.client_uid} value={c.client_uid}>{c.client_name} ({c.client_email})</option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <div className="text-[10px] text-[#F97316] mt-1">No other clients found</div>
                )}
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-black text-[#667781] block mb-1">Amount (tokens)</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full h-9 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] font-black text-[#111B21] outline-none focus:border-[#128C7E]"
                />
              </div>

              {error && <div className="text-[11px] text-[#EF4444] font-black mb-2">{error}</div>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="h-8 px-4 rounded-full text-[11px] font-black bg-[#128C7E] text-white border-none cursor-pointer disabled:opacity-50"
              >
                {loading ? "Transferring…" : "Confirm Transfer"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
