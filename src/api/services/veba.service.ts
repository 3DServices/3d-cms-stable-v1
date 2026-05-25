import { get, post, put } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { RequestOptions } from "../types";
import type { VebaStatistics, VebaListing, CreateVebaListingRequest, CreateVebaListingResponse } from "../types";
import type { BookingRequest, CreateBookingRequest, CreateBookingRequestResponse } from "../types";

/* ── Statistics ────────────────────────────────────────────────────── */

export function getVebaStatistics(
  opts?: RequestOptions,
): Promise<VebaStatistics> {
  return get<VebaStatistics>(ENDPOINTS.VEBA.STATISTICS, opts).then(res => res.data);
}

/* ── Listings ──────────────────────────────────────────────────────── */

export function getVebaListings(
  accountRoot: string,
  opts?: RequestOptions,
): Promise<{ data: VebaListing[] }> {
  return get<{ data: VebaListing[] }>(
    `${ENDPOINTS.VEBA.LISTINGS}/${accountRoot}`,
    opts,
  ).then(res => res.data);
}

export function createVebaListing(
  payload: CreateVebaListingRequest,
  opts?: RequestOptions,
): Promise<CreateVebaListingResponse> {
  return post<CreateVebaListingResponse>(
    ENDPOINTS.VEBA.LISTINGS_CREATE,
    payload,
    opts,
  ).then(res => res.data);
}

export function updateVebaListing(
  listingUid: string,
  fields: Record<string, unknown>,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.LISTINGS_UPDATE}/${listingUid}/update`,
    fields,
    opts,
  );
}

export function pauseVebaListing(
  listingUid: string,
  updatedBy: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.LISTINGS_PAUSE}/${listingUid}/pause`,
    { updated_by: updatedBy },
    opts,
  );
}

export function reactivateVebaListing(
  listingUid: string,
  updatedBy: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.LISTINGS_REACTIVATE}/${listingUid}/reactivate`,
    { updated_by: updatedBy },
    opts,
  );
}

export function archiveVebaListing(
  listingUid: string,
  updatedBy: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.LISTINGS_ARCHIVE}/${listingUid}/archive`,
    { updated_by: updatedBy },
    opts,
  );
}

/* ── Booking requests ──────────────────────────────────────────────── */

export function getBookingRequests(
  accountRoot: string,
  opts?: RequestOptions,
): Promise<{ data: BookingRequest[] }> {
  return get<{ data: BookingRequest[] }>(
    `${ENDPOINTS.VEBA.BOOKING_REQUESTS}/${accountRoot}`,
    opts,
  ).then(res => res.data);
}

export function createBookingRequest(
  payload: CreateBookingRequest,
  opts?: RequestOptions,
): Promise<CreateBookingRequestResponse> {
  return post<CreateBookingRequestResponse>(
    ENDPOINTS.VEBA.BOOKING_CREATE,
    payload,
    opts,
  ).then(res => res.data);
}

export function approveBookingRequest(
  requestUid: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.BOOKING_APPROVE}/${requestUid}/approve`,
    {},
    opts,
  );
}

export function rejectBookingRequest(
  requestUid: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.BOOKING_REJECT}/${requestUid}/reject`,
    {},
    opts,
  );
}

export function cancelBookingRequest(
  requestUid: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.BOOKING_CANCEL}/${requestUid}/cancel`,
    {},
    opts,
  );
}

export function fulfillBookingRequest(
  requestUid: string,
  opts?: RequestOptions,
) {
  return put(
    `${ENDPOINTS.VEBA.BOOKING_FULFILL}/${requestUid}/fulfill`,
    {},
    opts,
  );
}
