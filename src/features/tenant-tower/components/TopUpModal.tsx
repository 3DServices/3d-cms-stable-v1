import React, { useState } from "react";
import { buyTokens } from "../../../api";

interface Props {
  open: boolean;
  onClose: () => void;
  clientUid: string | null;
  clientName: string;
  tokenUid: string | null;
  tokenName: string;
  onSuccess: () => void;
}

export function TopUpModal({ open, onClose, clientUid, clientName, tokenUid, tokenName, onSuccess }: Props) {
  const [quantity, setQuantity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  function reset() {
    setQuantity("");
    setPhoneNumber("");
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!clientUid) return;
    if (!tokenUid) { setError("Client has no token plan assigned"); return; }
    const num = Number(quantity);
    if (!num || num <= 0) { setError("Enter a positive token quantity"); return; }
    if (!phoneNumber.trim()) { setError("Enter a Mobile Money number"); return; }

    setLoading(true);
    setError(null);
    try {
      await buyTokens({
        token_buyer: clientUid,
        token_uid: tokenUid,
        mobile_money_number: phoneNumber.trim(),
        token_quantity: num,
      });
      setSuccess(true);
      onSuccess();
    } catch (e: any) {
      console.error("[BuyTokens] error:", e);
      setError(e?.message ?? "Token purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-[420px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E9EDEF]">
          <span className="font-black text-[14px] text-[#111B21]">Buy Tokens</span>
          <button onClick={handleClose} className="text-[11px] text-[#667781] bg-[#F0F2F5] border border-[#E9EDEF] rounded-lg px-3 py-1.5 cursor-pointer font-black hover:bg-[#E9EDEF]">Close</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="text-[12px] text-[#667781] mb-3">
            Buy tokens for <span className="font-black text-[#111B21]">{clientName}</span>
            {tokenName && <> — <span className="font-black text-[#128C7E]">{tokenName}</span></>}
          </div>

          {success ? (
            <div className="bg-[#EAF7F3] border border-[#25D366] rounded-xl p-4 text-center">
              <div className="text-[14px] font-black text-[#128C7E]">Purchase Successful</div>
              <div className="text-[12px] text-[#667781] mt-1">Token purchase submitted via Mobile Money</div>
              <button onClick={handleClose} className="mt-3 h-8 px-4 rounded-full text-[11px] font-black bg-[#128C7E] text-white border-none cursor-pointer">Done</button>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="text-[10px] font-black text-[#667781] block mb-1">Quantity (hours)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full h-9 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] font-black text-[#111B21] outline-none focus:border-[#128C7E]"
                />
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-black text-[#667781] block mb-1">Mobile Money Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 256770123456"
                  className="w-full h-9 rounded-lg border border-[#E9EDEF] bg-[#F8FAFC] px-3 text-[12px] font-black text-[#111B21] outline-none focus:border-[#128C7E]"
                />
              </div>

              {error && <div className="text-[11px] text-[#EF4444] font-black mb-2">{error}</div>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="h-8 px-4 rounded-full text-[11px] font-black bg-[#128C7E] text-white border-none cursor-pointer disabled:opacity-50"
              >
                {loading ? "Processing…" : "Confirm Purchase"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
