/**
 * veba.types.ts — Types for the VEBA marketplace.
 */

// ── Statistics ──────────────────────────────────────────────────────────────

export interface VebaStatistics {
  bookings_today: number;
  leakage_attempts: number;
  settlement_p95: string;
  settlement_p95_minutes: number;
}

// ── Marketplace Listing ─────────────────────────────────────────────────────

export type ListingStatus =
  | "active"
  | "paused"
  | "archived"
  | "draft";

export type ListingVisibility =
  | "public"
  | "tenant";

export type PricingBasis = "per_day" | "per_hour" | "per_km" | "per_trip";

/**
 * Denormalized asset summary attached to a listing at create time. Lets the
 * marketplace render asset details (name, class, owner, country) without
 * needing a separate /assets fetch per card.
 */
export interface VebaListingAssetSummary {
  asset_uid:     string;
  display_name?: string;
  asset_class?:  string;       // "VEH" | "PPL" | "GDS" or future values
  owner_org?:    string;
  country?:      string;
  photo_url?:    string;
}

export interface VebaListing {
  listing_uid:   string;
  asset_uid:     string;
  account_root:  string;
  created_by:    string;
  created_at:    string;
  updated_at:    string;

  // Commercial terms
  daily_rate:           number;
  currency:             string;
  pricing_basis:        PricingBasis;
  hourly_rate?:         number | null;
  availability_start?:  string | null;
  availability_end?:    string | null;
  geographic_scope?:    string | null;
  operator_included:    boolean;
  notes?:               string | null;

  // Surfacing
  visibility:    ListingVisibility;
  status:        ListingStatus;

  // Denormalized asset summary (optional; backend may or may not include it)
  asset_summary?: VebaListingAssetSummary;
}

export interface CreateVebaListingRequest {
  asset_uid:           string;
  account_root:        string;
  created_by:          string;
  daily_rate:          number;
  currency:            string;
  pricing_basis:       PricingBasis;
  hourly_rate?:        number | null;
  availability_start?: string | null;
  availability_end?:   string | null;
  geographic_scope?:   string | null;
  operator_included:   boolean;
  notes?:              string | null;
  visibility:          ListingVisibility;
}

export interface CreateVebaListingResponse {
  listing_uid: string;
}
