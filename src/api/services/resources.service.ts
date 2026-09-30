/**
 * resources.service.ts — Resources API service (staff only).
 *
 * Endpoints:
 *   GET    /resources/admin/clients/{client_uid}/list     → listResources
 *   GET    /resources/admin/clients/{client_uid}/catalog  → getResourceCatalog
 *   POST   /resources/admin/create                        → createResource
 *   GET    /resources/admin/{resource_uid}/details        → getResource
 *   PUT    /resources/admin/{resource_uid}/update         → updateResource
 *   DELETE /resources/admin/{resource_uid}/delete         → deleteResource
 *   PUT    /resources/admin/{resource_uid}/items          → setResourceItems
 *   PUT    /resources/admin/{resource_uid}/access         → setResourceAccess
 */

import { get, post, put, del } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type {
  ResourceSummary, ResourceCatalog, ResourceDetail,
  CreateResourceRequest, UpdateResourceRequest,
  ResourceItemType, ResourceAccessLevel, SetResourceItemsResponse,
} from "../types/resources.types";

/** A client's resources, with how many elements and users each has. */
export function listResources(
  clientUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ResourceSummary[]>> {
  return get<ResourceSummary[]>(`${ENDPOINTS.RESOURCES.CLIENT}/${clientUid}/list`, opts);
}

/** Every element a resource of this client can hold, and the client's users. */
export function getResourceCatalog(
  clientUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ResourceCatalog>> {
  return get<ResourceCatalog>(`${ENDPOINTS.RESOURCES.CLIENT}/${clientUid}/catalog`, opts);
}

export function createResource(
  payload: CreateResourceRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<{ resource_uid: string }>> {
  return post<{ resource_uid: string }>(ENDPOINTS.RESOURCES.CREATE, { data: payload }, opts);
}

export function getResource(
  resourceUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ResourceDetail>> {
  return get<ResourceDetail>(`${ENDPOINTS.RESOURCES.ADMIN}/${resourceUid}/details`, opts);
}

export function updateResource(
  resourceUid: string,
  payload: UpdateResourceRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<string>> {
  return put<string>(`${ENDPOINTS.RESOURCES.ADMIN}/${resourceUid}/update`, { data: payload }, opts);
}

/** Delete the resource. Its elements become visible to the whole team again. */
export function deleteResource(
  resourceUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<{ released_items: number }>> {
  return del<{ released_items: number }>(`${ENDPOINTS.RESOURCES.ADMIN}/${resourceUid}/delete`, undefined, opts);
}

/** Make the resource hold exactly these elements (moving any from other resources). */
export function setResourceItems(
  resourceUid: string,
  items: { item_type: ResourceItemType; item_uid: string }[],
  opts?: RequestOptions,
): Promise<ApiResponse<SetResourceItemsResponse>> {
  return put<SetResourceItemsResponse>(`${ENDPOINTS.RESOURCES.ADMIN}/${resourceUid}/items`, { data: { items } }, opts);
}

/** Share the resource with exactly these users. */
export function setResourceAccess(
  resourceUid: string,
  access: { account_uid: string; access_level: ResourceAccessLevel }[],
  opts?: RequestOptions,
): Promise<ApiResponse<{ granted: number }>> {
  return put<{ granted: number }>(`${ENDPOINTS.RESOURCES.ADMIN}/${resourceUid}/access`, { data: { access } }, opts);
}
