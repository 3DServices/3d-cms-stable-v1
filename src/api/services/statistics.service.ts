import { get } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type { SimStatistics, OnlineUnitsResponse, OfflineUnitsResponse, ExpiredTokensResponse } from "../types";

export function getSimStatistics(
  opts?: RequestOptions,
): Promise<ApiResponse<SimStatistics>> {
  return get<SimStatistics>(ENDPOINTS.STATISTICS.SIMS_SUMMARY, opts);
}

/** Fetch online units (system-wide). */
export function getOnlineUnits(
  opts?: RequestOptions,
): Promise<ApiResponse<OnlineUnitsResponse>> {
  return get<OnlineUnitsResponse>(ENDPOINTS.STATISTICS.UNITS_ONLINE, opts);
}

/** Fetch offline units (system-wide). */
export function getOfflineUnits(
  opts?: RequestOptions,
): Promise<ApiResponse<OfflineUnitsResponse>> {
  return get<OfflineUnitsResponse>(ENDPOINTS.STATISTICS.UNITS_OFFLINE, opts);
}

/** Fetch expired token subscriptions (system-wide). */
export function getExpiredTokens(
  opts?: RequestOptions,
): Promise<ApiResponse<ExpiredTokensResponse>> {
  return get<ExpiredTokensResponse>(ENDPOINTS.STATISTICS.TOKENS_EXPIRED, opts);
}
