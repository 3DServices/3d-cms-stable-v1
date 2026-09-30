/**
 * resources.types.ts — Resources (navas-core-apis endpoints/resources.py).
 *
 * A resource belongs to one client and holds some of that client's existing
 * geofences, geofence groups and event rules. Users of the client granted the
 * resource see those elements in OLIWA and the mobile app; the rest of the
 * team doesn't. Elements in no resource are visible to the whole team.
 */

export type ResourceItemType = "geozone" | "geozone_group" | "event_rule";
export type ResourceAccessLevel = "view" | "manage";

export interface ResourceSummary {
  resource_uid: string;
  resource_name: string;
  resource_description: string;
  created_at: string | null;
  updated_at: string | null;
  item_count: number;
  user_count: number;
}

export interface ResourceCatalogElement {
  uid: string;
  name: string | null;
  owner_uid: string;
  owner_name: string | null;
  resource_uid: string | null;
  resource_name: string | null;
}

export interface ResourceCatalogUser {
  account_uid: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  /** Account administrators (and staff) see every element; grants don't change what they see. */
  sees_everything: boolean;
}

export interface ResourceCatalog {
  elements: Record<ResourceItemType, ResourceCatalogElement[]>;
  users: ResourceCatalogUser[];
}

export interface ResourceGrant {
  account_uid: string;
  access_level: ResourceAccessLevel;
  display_name: string | null;
  username: string | null;
  granted_by: string | null;
  granted_at: string | null;
}

export interface ResourceDetail {
  resource_uid: string;
  client_uid: string;
  resource_name: string;
  resource_description: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: Record<ResourceItemType, { uid: string; name: string | null }[]>;
  access: ResourceGrant[];
}

export interface CreateResourceRequest {
  client_uid: string;
  resource_name: string;
  resource_description?: string;
}

export interface UpdateResourceRequest {
  resource_name: string;
  resource_description?: string;
}

export interface SetResourceItemsResponse {
  held: number;
  released: number;
  moved: { item_type: ResourceItemType; item_uid: string; from_resource: string }[];
}
