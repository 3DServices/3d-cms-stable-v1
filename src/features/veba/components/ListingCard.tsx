/**
 * ListingCard — Marketplace card for a single VebaListing.
 *
 * Renders the listing's asset summary, commercial terms, availability, and
 * a "Request booking" CTA gated by `can_book_asset` (Slice 3 enforcement).
 * Phase 2 only surfaces the action; the booking flow itself lands in Phase 3.
 */

import React from "react";
import type { VebaListing, PricingBasis } from "../../../api/types";
import { GuardedButton } from "../../../auth/guards";

// ── Helpers ──────────────────────────────────────────────────────────────────

function basisLabel(b: PricingBasis): string {
  switch (b) {
    case "per_day":  return "/day";
    case "per_hour": return "/hr";
    case "per_km":   return "/km";
    case "per_trip": return "/trip";
  }
}

function formatRate(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

function formatWindow(start?: string | null, end?: string | null): string {
  if (!start && !end) return "Available now";
  if (start && !end)  return `From ${start}`;
  if (!start && end)  return `Until ${end}`;
  return `${start} → ${end}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export interface ListingCardProps {
  listing: VebaListing;
  /** Called when the user clicks "Request booking". Phase 3 wires the real flow. */
  onRequestBooking?: (listing: VebaListing) => void;
}

export function ListingCard({ listing, onRequestBooking }: ListingCardProps) {
  const summary = listing.asset_summary;
  const title   = summary?.display_name ?? listing.asset_uid;
  const cls     = summary?.asset_class;
  const owner   = summary?.owner_org;
  const country = summary?.country;
  const initial = (title || "?").charAt(0).toUpperCase();

  return (
    <article className="bg-white border border-[#E9EDEF] rounded-xl overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
      {/* Photo / placeholder */}
      <div className="h-32 bg-[#F0F2F5] border-b border-[#E9EDEF] relative">
        {summary?.photo_url ? (
          <img
            src={summary.photo_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[40px] font-black text-[#C2E8E1]">
            {initial}
          </div>
        )}
        {/* Visibility badge */}
        <div className="absolute top-2 right-2">
          {listing.visibility === "tenant" ? (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#E9EDEF] text-[#667781]">
              Tenant-private
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#128C7E] text-white">
              Marketplace
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-extrabold text-[13px] text-[#111B21] truncate" title={title}>
              {title}
            </div>
            <div className="text-[11px] text-[#667781] truncate">
              {[cls, owner, country].filter(Boolean).join(" • ") || "—"}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[15px] font-black text-[#111B21] leading-tight whitespace-nowrap">
              {formatRate(listing.daily_rate, listing.currency)}
            </div>
            <div className="text-[10px] text-[#667781]">
              {basisLabel(listing.pricing_basis)}
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="text-[10px] font-medium bg-[#F0F2F5] border border-[#E9EDEF] rounded-full px-2 py-0.5 text-[#111B21]">
            {formatWindow(listing.availability_start, listing.availability_end)}
          </span>
          {listing.geographic_scope && (
            <span
              className="text-[10px] font-medium bg-[#F0F2F5] border border-[#E9EDEF] rounded-full px-2 py-0.5 text-[#111B21]"
              title={listing.geographic_scope}
            >
              {listing.geographic_scope.length > 20
                ? listing.geographic_scope.slice(0, 20) + "…"
                : listing.geographic_scope}
            </span>
          )}
          {listing.operator_included && (
            <span className="text-[10px] font-medium bg-[#E9F7F4] border border-[#C2E8E1] rounded-full px-2 py-0.5 text-[#075E54]">
              Operator incl.
            </span>
          )}
          {listing.hourly_rate != null && (
            <span className="text-[10px] font-medium bg-[#F0F2F5] border border-[#E9EDEF] rounded-full px-2 py-0.5 text-[#667781]">
              {listing.currency} {listing.hourly_rate.toLocaleString()}/hr also
            </span>
          )}
        </div>

        {/* Notes — short snippet only */}
        {listing.notes && (
          <p className="text-[11px] text-[#667781] line-clamp-2 mt-1">
            {listing.notes}
          </p>
        )}

        {/* Action */}
        <div className="mt-auto pt-2">
          <GuardedButton
            permission="can_book_asset"
            onClick={() => onRequestBooking?.(listing)}
            className="w-full px-3 py-1.5 text-[12px] font-extrabold rounded-md bg-[#128C7E] text-white hover:bg-[#0D7466] cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request booking
          </GuardedButton>
        </div>
      </div>
    </article>
  );
}
