/**
 * booking.types.ts — Types for VEBA booking requests.
 */

export type BookingRequestStatus = "pending" | "approved" | "rejected" | "cancelled" | "fulfilled";

export interface BookingRequest {
  request_uid:    string;
  listing_uid:    string;
  asset_uid:      string;
  requester_uid:  string;
  requester_root: string;
  owner_root:     string;

  start_date:     string;
  end_date:       string;
  notes?:         string | null;

  status:         BookingRequestStatus;
  created_at:     string;
  updated_at:     string;

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
