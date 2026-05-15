/**
 * MyListings — Owner-facing management view of the current tenant's VEBA
 * listings. Phase 3.
 *
 * Lists every listing owned by the current account_root (active, paused, and
 * archived). Each row exposes lifecycle actions:
 *
 *   - Pause       — hides from marketplace; preserves record
 *   - Reactivate  — re-publishes a paused listing
 *   - Archive     — soft-delete; no new bookings; existing ones continue
 *
 * Each action is guarded by the matching catalog permission via
 * useGuardedMutation (Slice 3 enforcement). After any state change, the
 * listings list is re-fetched.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  archiveVebaListing,
  getVebaListings,
  pauseVebaListing,
  reactivateVebaListing,
} from "../../../api/services/veba.service";
import { useAuth } from "../../../auth/AuthContext";
import { useGuardedMutation, GuardedButton } from "../../../auth/guards";
import type { VebaListing, ListingStatus } from "../../../api/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ListingStatus, { bg: string; fg: string; label: string }> = {
  active:   { bg: "#E9F7F4", fg: "#075E54", label: "Active" },
  paused:   { bg: "#FFF4E5", fg: "#9A6700", label: "Paused" },
  archived: { bg: "#F0F2F5", fg: "#667781", label: "Archived" },
  draft:    { bg: "#F0F2F5", fg: "#667781", label: "Draft" },
};

function StatusPill({ status }: { status: ListingStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

function formatRate(l: VebaListing): string {
  return `${l.currency} ${l.daily_rate.toLocaleString()} / day`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MyListings() {
  const { state: authState } = useAuth();
  const [listings, setListings] = useState<VebaListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  // ── Load + refresh ───────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    if (!authState.accountRoot) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getVebaListings(authState.accountRoot);
      setListings(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [authState.accountRoot]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ── Mutations ────────────────────────────────────────────────────────────
  // Permissions chosen to align with the catalog:
  //   pause / reactivate → can_edit_asset_listing (state change, not destructive)
  //   archive            → can_edit_asset_listing as well (no separate "delete listing" key
  //                        in the catalog; archive is the destructive-equivalent action)
  const pauseMut = useGuardedMutation(
    "can_edit_asset_listing",
    (uid: string) => pauseVebaListing(uid, authState.accountUid ?? "system"),
  );
  const reactivateMut = useGuardedMutation(
    "can_edit_asset_listing",
    (uid: string) => reactivateVebaListing(uid, authState.accountUid ?? "system"),
  );
  const archiveMut = useGuardedMutation(
    "can_edit_asset_listing",
    (uid: string) => archiveVebaListing(uid, authState.accountUid ?? "system"),
  );

  const run = async (
    mutation: typeof pauseMut,
    uid: string,
    confirmText?: string,
  ) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setPendingUid(uid);
    try {
      await mutation.mutate(uid);
      await fetchListings();
    } catch (err) {
      // mutation.error already set; we show it in the global error banner.
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setPendingUid(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-[3px] border-[#128C7E] border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] text-[#667781]">Loading your listings…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#FFD6D6] rounded-xl p-6 text-[12px] text-[#B00020]">
        Couldn't load listings: {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white border border-[#E9EDEF] rounded-xl p-8 text-center">
        <div className="text-[16px] font-extrabold text-[#111B21] mb-1">
          You haven't listed anything yet
        </div>
        <p className="text-[12px] text-[#667781]">
          Open the Asset Digital Twin and click "List on VEBA" on any idle asset.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E9EDEF] flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-[13px] text-[#111B21]">My listings</h2>
          <p className="text-[11px] text-[#667781]">
            {listings.length} listing{listings.length === 1 ? "" : "s"} for this tenant
          </p>
        </div>
        <button
          type="button"
          onClick={fetchListings}
          className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
              <th className="text-left font-extrabold text-[#667781] px-3 py-2">Asset</th>
              <th className="text-left font-extrabold text-[#667781] px-3 py-2">Rate</th>
              <th className="text-left font-extrabold text-[#667781] px-3 py-2">Window</th>
              <th className="text-left font-extrabold text-[#667781] px-3 py-2">Visibility</th>
              <th className="text-left font-extrabold text-[#667781] px-3 py-2">Status</th>
              <th className="text-right font-extrabold text-[#667781] px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => {
              const title = l.asset_summary?.display_name ?? l.asset_uid;
              const cls = l.asset_summary?.asset_class;
              const isPending = pendingUid === l.listing_uid;
              const window =
                l.availability_start || l.availability_end
                  ? `${l.availability_start ?? "—"} → ${l.availability_end ?? "open"}`
                  : "Available now";

              return (
                <tr
                  key={l.listing_uid}
                  className="border-b border-[#E9EDEF] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-extrabold text-[#111B21]">{title}</div>
                    <div className="text-[11px] text-[#667781]">
                      {[cls, l.asset_summary?.owner_org, l.asset_summary?.country]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{formatRate(l)}</td>
                  <td className="px-3 py-2.5 text-[#667781] whitespace-nowrap">{window}</td>
                  <td className="px-3 py-2.5">
                    {l.visibility === "tenant" ? "Tenant-private" : "Marketplace"}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5 justify-end">
                      {l.status === "active" && (
                        <GuardedButton
                          permission="can_edit_asset_listing"
                          onClick={() => run(pauseMut, l.listing_uid)}
                          disabled={isPending}
                          className="px-2 py-1 text-[11px] font-extrabold rounded-md border border-[#E9EDEF] bg-white text-[#111B21] hover:bg-[#F0F2F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? "…" : "Pause"}
                        </GuardedButton>
                      )}
                      {l.status === "paused" && (
                        <GuardedButton
                          permission="can_edit_asset_listing"
                          onClick={() => run(reactivateMut, l.listing_uid)}
                          disabled={isPending}
                          className="px-2 py-1 text-[11px] font-extrabold rounded-md bg-[#128C7E] text-white hover:bg-[#0D7466] cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? "…" : "Reactivate"}
                        </GuardedButton>
                      )}
                      {l.status !== "archived" && (
                        <GuardedButton
                          permission="can_edit_asset_listing"
                          onClick={() =>
                            run(
                              archiveMut,
                              l.listing_uid,
                              "Archive this listing? Existing bookings will continue, but no new ones can be requested.",
                            )
                          }
                          disabled={isPending}
                          className="px-2 py-1 text-[11px] font-extrabold rounded-md border border-[#FFD6D6] bg-white text-[#B00020] hover:bg-[#FFF5F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? "…" : "Archive"}
                        </GuardedButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
