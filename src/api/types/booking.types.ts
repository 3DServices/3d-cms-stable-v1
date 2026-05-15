/**
 * booking.types.ts — Types for VEBA booking requests.
 *
 * A BookingRequest is created when a marketplace browser clicks
 * "Request booking" on a listing. The owner then approves / rejects via
 * the existing wizard flows; this file only models the request itself.
 */

export type BookingRequestStatus =
  | "pending"     // Awaiting owner decision
  | "approved"
  | "rejected"
  | "cancelled"
  | "fulfilled";  // Completed booking

export interface BookingRequest {
  request_uid:    string;
  listing_uid:    string;
  asset_uid:      string;
  requester_uid:  string;          // account_uid of the user requesting
  requester_root: string;          // tenant of the requester
  owner_root:     string;          // tenant of the listing owner

  start_date:     string;          // ISO date
  end_date:       string;          // ISO date
  notes?:         string | null;

  status:         BookingRequestStatus;
  created_at:     string;
  updated_at:     string;

  /** Frozen at submission time so rate changes don't affect pending requests. */
  rate_snapshot:  {
    daily_rate:     number;
    currency:       string;
    pricing_basis:  string;
  };
}

export interface CreateBookingRequest {
  listing_uid:    string;
  requester_uid:  string;
  requester_root: string;
  start_date:     string;
  end_date:       string;
  notes?:         string | null;
}

export interface CreateBookingRequestResponse {
  request_uid: string;
}
