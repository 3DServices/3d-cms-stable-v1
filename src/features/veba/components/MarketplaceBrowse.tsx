/**
 * MarketplaceBrowse — Buyer-facing view of the VEBA marketplace.
 */

import React, { useEffect, useMemo, useState } from "react";
import { getVebaListings } from "../../../api/services/veba.service";
import { useAuth } from "../../../auth/AuthContext";
import { usePermissions } from "../../../auth/PermissionsContext";
import type { VebaListing } from "../../../api/types";
import { ListingCard } from "./ListingCard";

interface Filters {
  assetClass: string;
  operatorOnly: boolean;
  minRate: string;
  maxRate: string;
  scope: string;
}

const INITIAL_FILTERS: Filters = {
  assetClass: "",
  operatorOnly: false,
  minRate: "",
  maxRate: "",
  scope: "",
};

function applyFilters(listings: VebaListing[], f: Filters): VebaListing[] {
  return listings.filter((l) => {
    if (l.status !== "active") return false;
    if (f.assetClass && l.asset_summary?.asset_class !== f.assetClass) return false;
    if (f.operatorOnly && !l.operator_included) return false;
    const min = f.minRate ? Number(f.minRate) : -Infinity;
    const max = f.maxRate ? Number(f.maxRate) :  Infinity;
    if (Number.isFinite(min) && l.daily_rate < min) return false;
    if (Number.isFinite(max) && l.daily_rate > max) return false;
    if (f.scope) {
      const needle = f.scope.toLowerCase();
      const hay = (l.geographic_scope ?? "").toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function collectAssetClasses(listings: VebaListing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) {
    const c = l.asset_summary?.asset_class;
    if (c) set.add(c);
  }
  return Array.from(set).sort();
}

interface MarketplaceBrowseProps {
  onRequestBooking?: (listing: VebaListing) => void;
}

export function MarketplaceBrowse({ onRequestBooking }: MarketplaceBrowseProps = {}) {
  const { state: authState } = useAuth();
  const { hasPermission } = usePermissions();
  const canBrowse = hasPermission("can_browse_asset_listings");

  const [listings, setListings] = useState<VebaListing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filters, setFilters]   = useState<Filters>(INITIAL_FILTERS);
  const [stubFor, setStubFor]   = useState<string | null>(null);

  useEffect(() => {
    if (!authState.accountRoot || !canBrowse) {
      setListings([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getVebaListings(authState.accountRoot)
      .then((res) => { if (!cancelled) setListings(res.data ?? []); })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load marketplace.");
        setListings([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authState.accountRoot, canBrowse]);

  if (!canBrowse) {
    return (
      <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 text-center">
        <div className="text-[14px] font-extrabold text-[#111B21] mb-1">Access restricted</div>
        <p className="text-[12px] text-[#667781]">You do not have permission to browse marketplace listings. Contact your administrator to request access.</p>
      </div>
    );
  }

  const visible = useMemo(() => applyFilters(listings, filters), [listings, filters]);
  const assetClasses = useMemo(() => collectAssetClasses(listings), [listings]);

  const handleRequestBooking = (l: VebaListing) => {
    if (onRequestBooking) { onRequestBooking(l); return; }
    setStubFor(l.listing_uid);
    window.setTimeout(() => setStubFor(null), 2200);
  };

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  return (
    <div className="flex flex-col gap-3">
      <section className="bg-white border border-[#E9EDEF] rounded-xl p-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Asset class</span>
          <select
            value={filters.assetClass}
            onChange={(e) => setFilters((f) => ({ ...f, assetClass: e.target.value }))}
            className="px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E]"
          >
            <option value="">All</option>
            {assetClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[110px]">
          <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Min daily rate</span>
          <input
            type="number" inputMode="numeric" placeholder="0"
            value={filters.minRate}
            onChange={(e) => setFilters((f) => ({ ...f, minRate: e.target.value }))}
            className="px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E]"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[110px]">
          <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Max daily rate</span>
          <input
            type="number" inputMode="numeric" placeholder="no max"
            value={filters.maxRate}
            onChange={(e) => setFilters((f) => ({ ...f, maxRate: e.target.value }))}
            className="px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E]"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <span className="text-[10px] font-medium text-[#667781] uppercase tracking-wide">Geographic scope contains</span>
          <input
            value={filters.scope}
            onChange={(e) => setFilters((f) => ({ ...f, scope: e.target.value }))}
            placeholder="e.g. Kampala, EAC"
            className="px-2 py-1.5 text-[12px] border border-[#E9EDEF] rounded-md bg-white text-[#111B21] outline-none focus:border-[#128C7E]"
          />
        </div>

        <label className="flex items-center gap-1.5 text-[12px] text-[#111B21] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.operatorOnly}
            onChange={(e) => setFilters((f) => ({ ...f, operatorOnly: e.target.checked }))}
          />
          Operator only
        </label>

        <button
          type="button"
          onClick={resetFilters}
          className="px-2.5 py-1.5 text-[11px] font-medium rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer"
        >
          Reset
        </button>

        <div className="text-[11px] text-[#667781] ml-auto">
          <span className="font-extrabold text-[#111B21]">{visible.length}</span> of {listings.length} listing{listings.length === 1 ? "" : "s"}
        </div>
      </section>

      {stubFor && (
        <div className="bg-[#E9F7F4] border border-[#C2E8E1] rounded-xl px-3 py-2 text-[12px] text-[#075E54]">
          Booking handler not yet wired in this context.
        </div>
      )}

      {loading && (
        <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-[3px] border-[#128C7E] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-[#667781]">Loading marketplace...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-[#FFD6D6] rounded-xl p-6 text-[12px] text-[#B00020]">Could not load listings: {error}</div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 text-center">
          <div className="text-[18px] font-extrabold text-[#111B21] mb-1">No listings yet</div>
          <p className="text-[12px] text-[#667781]">Idle vehicles or equipment can be listed from the Asset Digital Twin.</p>
        </div>
      )}

      {!loading && !error && listings.length > 0 && visible.length === 0 && (
        <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 text-center">
          <div className="text-[14px] font-extrabold text-[#111B21] mb-1">No matches</div>
          <p className="text-[12px] text-[#667781]">Try widening your filters.</p>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {visible.map((l) => (
            <ListingCard key={l.listing_uid} listing={l} onRequestBooking={handleRequestBooking} />
          ))}
        </div>
      )}
    </div>
  );
}
