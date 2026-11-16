/**
 * branding.service.ts — client branding, for 3D Services staff.
 *
 * Endpoints (navas-core-apis endpoints/branding.py):
 *   GET    /branding/clients/{client_uid}          → getClientBranding   (branding.control or .override)
 *   PUT    /branding/clients/{client_uid}/control  → setBrandingControl  (branding.control)
 *   PUT    /branding/clients/{client_uid}          → setClientLook       (branding.override)
 *   DELETE /branding/clients/{client_uid}          → resetClientLook     (branding.override)
 */

import { del, get, put } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type { BrandingControl, BrandingLookFields, ClientBranding } from "../types/branding.types";

const path = (clientUid: string) =>
  `${ENDPOINTS.BRANDING.CLIENT}/${encodeURIComponent(clientUid)}`;

export function getClientBranding(
  clientUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ClientBranding>> {
  return get<ClientBranding>(path(clientUid), opts);
}

/** Only the fields sent change. */
export function setBrandingControl(
  clientUid: string,
  fields: Partial<BrandingControl>,
  opts?: RequestOptions,
): Promise<ApiResponse<ClientBranding>> {
  return put<ClientBranding>(`${path(clientUid)}/control`, { data: fields }, opts);
}

export function setClientLook(
  clientUid: string,
  fields: BrandingLookFields,
  opts?: RequestOptions,
): Promise<ApiResponse<ClientBranding>> {
  return put<ClientBranding>(path(clientUid), { data: fields }, opts);
}

export function resetClientLook(
  clientUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ClientBranding>> {
  return del<ClientBranding>(path(clientUid), undefined, opts);
}
