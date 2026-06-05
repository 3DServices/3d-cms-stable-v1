/**
 * CreateListingDrawer — Slide-in drawer for creating a new VEBA marketplace
 * listing directly from the My Listings tab (without going via Asset Twin).
 *
 * The user supplies the asset UID and optional summary fields. Pricing,
 * availability, visibility, and notes work identically to ListOnVebaDrawer.
 */

import React, { useState } from "react";
import { createVebaListing } from "../../../api/services/veba.service";
import { useAuth } from "../../../auth/AuthContext";
import { useGuardedMutation, GuardedButton } from "../../../auth/guards";
import type {
  CreateVebaListingRequest,
  ListingVisibility,
  PricingBasis,
} from "../../../api/types";

interface CreateListingDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateListingDrawer({ open, onClose, onCreated }: CreateListingDrawerProps) {
  const { state: authState } = useAuth();

  // Asset identification
  const [assetUid, setAssetUid] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [assetClass, setAssetClass] = useState("");
  const [ownerOrg, setOwnerOrg] = useState("");
  const [country, setCountry] = useState("");

  // Pricing
  const [dailyRate, setDailyRate] = useState("");
  const [currency, setCurrency] = useState("UGX");
  const [pricingBasis, setPricingBasis] = useState<PricingBasis>("per_day");
  const [hourlyRate, setHourlyRate] = useState("");

  // Availability
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [availabilityEnd, setAvailabilityEnd] = useState("");
  const [geographicScope, setGeographicScope] = useState("");
  const [operatorIncluded, setOperatorIncluded] = useState(false);

  // Visibility & notes
  const [visibility, setVisibility] = useState<ListingVisibility>("public");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const listMutation = useGuardedMutation(
    "can_list_asset_on_marketplace",
    (payload: CreateVebaListingRequest) => createVebaListing(payload),
  );

  const resetForm = () => {
    setAssetUid(""); setDisplayName(""); setAssetClass(""); setOwnerOrg(""); setCountry("");
    setDailyRate(""); setCurrency("UGX"); setPricingBasis("per_day"); setHourlyRate("");
    setAvailabilityStart(""); setAvailabilityEnd(""); setGeographicScope(""); setOperatorIncluded(false);
    setVisibility("public"); setNotes(""); setValidationError(null);
    listMutation.reset();
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!assetUid.trim()) {
      setValidationError("Asset UID / IMEI is required.");
      return;
    }
    const dailyRateNum = Number(dailyRate);
    if (!dailyRate || !Number.isFinite(dailyRateNum) || dailyRateNum <= 0) {
      setValidationError("Daily rate must be a positive number.");
      return;
    }
    const hourlyRateNum = hourlyRate ? Number(hourlyRate) : null;
    if (hourlyRate && (!Number.isFinite(hourlyRateNum!) || hourlyRateNum! <= 0)) {
      setValidationError("Hourly rate, if provided, must be positive.");
      return;
    }
    if (availabilityStart && availabilityEnd && availabilityEnd < availabilityStart) {
      setValidationError("Availability end date must not be before the start date.");
      return;
    }
    if (!authState.accountRoot || !authState.accountUid) {
      setValidationError("Missing account context.");
      return;
    }

    const assetSummary = (displayName || assetClass || ownerOrg || country)
      ? {
          asset_uid: assetUid.trim(),
          display_name: displayName.trim() || undefined,
          asset_class: assetClass.trim() || undefined,
          owner_org: ownerOrg.trim() || undefined,
          country: country.trim() || undefined,
        }
      : undefined;

    const payload: CreateVebaListingRequest = {
      asset_uid: assetUid.trim(),
      account_root: authState.accountRoot,
      created_by: authState.accountUid,
      daily_rate: dailyRateNum,
      currency: currency.trim().toUpperCase() || "UGX",
      pricing_basis: pricingBasis,
      hourly_rate: hourlyRateNum,
      availability_start: availabilityStart || null,
      availability_end: availabilityEnd || null,
      geographic_scope: geographicScope.trim() || null,
      operator_included: operatorIncluded,
      notes: notes.trim() || null,
      visibility,
      ...(assetSummary ? { asset_summary: assetSummary } : {}),
    };

    try {
      await listMutation.mutate(payload);
      onCreated?.();
      handleClose();
    } catch {
      // listMutation.error rendered in footer
    }
  };

  if (!open) return null;

  const displayError = validationError ?? (listMutation.error ? listMutation.error.message : null);
  const busy = listMutation.isRunning;
  const inp = "px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E]";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[rgba(17,27,33,0.45)] z-[95]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-[48px] h-[calc(100vh-48px)] w-[480px] bg-white border-l border-[#E9EDEF] shadow-2xl flex flex-col z-[100]"
        role="dialog"
        aria-label="Create VEBA listing"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E9EDEF] flex items-center justify-between gap-3">
          <div>
            <div className="font-extrabold text-[14px] text-[#111B21]">New Marketplace Listing</div>
            <div className="text-[12px] text-[#667781]">List an idle asset on the VEBA marketplace</div>
          </div>
          <button
            type="button" onClick={handleClose}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Asset identification */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-3">
            <div className="text-[11px] font-extrabold text-[#111B21] mb-2">Asset</div>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Asset UID / IMEI *</span>
              <input value={assetUid} onChange={(e) => setAssetUid(e.target.value)}
                placeholder="e.g. IME-862107048639271" disabled={busy} className={inp} />
            </label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Display name</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Boda UAX 221P" disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Asset class</span>
                <input value={assetClass} onChange={(e) => setAssetClass(e.target.value)}
                  placeholder="e.g. Motorcycle" disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Owner org</span>
                <input value={ownerOrg} onChange={(e) => setOwnerOrg(e.target.value)}
                  placeholder="e.g. Kato Rentals" disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Country</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. UG" maxLength={4} disabled={busy} className={inp} />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-3">
            <div className="text-[11px] font-extrabold text-[#111B21] mb-2">Pricing</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Daily rate *</span>
                <input type="number" min="0" step="any" value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)} placeholder="e.g. 250000"
                  disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Currency</span>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)}
                  placeholder="UGX" maxLength={4} disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Pricing basis</span>
                <select value={pricingBasis}
                  onChange={(e) => setPricingBasis(e.target.value as PricingBasis)}
                  disabled={busy} className={inp}>
                  <option value="per_day">Per day</option>
                  <option value="per_hour">Per hour</option>
                  <option value="per_km">Per km</option>
                  <option value="per_trip">Per trip</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Hourly rate</span>
                <input type="number" min="0" step="any" value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)} placeholder="optional"
                  disabled={busy} className={inp} />
              </label>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-3">
            <div className="text-[11px] font-extrabold text-[#111B21] mb-2">Availability</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">From</span>
                <input type="date" value={availabilityStart}
                  onChange={(e) => setAvailabilityStart(e.target.value)} disabled={busy} className={inp} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">To (open-ended if blank)</span>
                <input type="date" value={availabilityEnd}
                  onChange={(e) => setAvailabilityEnd(e.target.value)} disabled={busy} className={inp} />
              </label>
            </div>
            <label className="flex flex-col gap-1 mt-3">
              <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Geographic scope</span>
              <input value={geographicScope} onChange={(e) => setGeographicScope(e.target.value)}
                placeholder="e.g. Uganda, Kampala only, EAC region" disabled={busy} className={inp} />
            </label>
            <label className="flex items-center gap-2 mt-3 text-[12px] text-[#111B21] cursor-pointer">
              <input type="checkbox" checked={operatorIncluded}
                onChange={(e) => setOperatorIncluded(e.target.checked)} disabled={busy} />
              Operator included
            </label>
          </div>

          {/* Visibility & notes */}
          <div className="bg-white border border-[#E9EDEF] rounded-xl p-3">
            <div className="text-[11px] font-extrabold text-[#111B21] mb-2">Visibility & notes</div>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                <input type="radio" name="create-visibility" value="public"
                  checked={visibility === "public"} onChange={() => setVisibility("public")} disabled={busy} />
                Marketplace public
              </label>
              <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                <input type="radio" name="create-visibility" value="tenant"
                  checked={visibility === "tenant"} onChange={() => setVisibility("tenant")} disabled={busy} />
                Tenant-private
              </label>
            </div>
            <label className="flex flex-col gap-1 mt-3">
              <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Condition, certifications, what's included..."
                disabled={busy}
                className="px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E] resize-y font-[inherit]"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#E9EDEF] bg-[#F8F9FA] flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#B00020] flex-1 min-h-[1em]">{displayError}</div>
          <div className="flex gap-2">
            <button type="button" onClick={handleClose} disabled={busy}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <GuardedButton
              permission="can_list_asset_on_marketplace"
              onClick={handleSubmit}
              disabled={busy}
              className="px-3 py-1 text-[11px] font-extrabold rounded-md bg-[#128C7E] text-white hover:bg-[#0D7466] border-0 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              {busy ? "Publishing..." : "Publish listing"}
            </GuardedButton>
          </div>
        </div>
      </aside>
    </>
  );
}
