/**
 * branding.types.ts — a client's own colours and assistant name for the OLIWA
 * web console and mobile app (navas-core-apis endpoints/branding.py).
 */

export type BrandingAdminScope = "all" | "selected";

/** What 3D Services staff decide for a client (branding.control). */
export interface BrandingControl {
  enabled: boolean;
  allow_colors: boolean;
  allow_assistant_name: boolean;
  admin_scope: BrandingAdminScope;
  allowed_admins: string[];
}

/** The look to paint with: the client's choices, or the defaults. */
export interface BrandingLook {
  brand_color: string;
  brand_dark: string;
  brand_light: string;
  brand_soft: string;
  on_brand: string;
  accent_color: string;
  accent_pressed: string;
  on_accent: string;
  assistant_name: string;
  customised: { brand_color: boolean; accent_color: boolean; assistant_name: boolean };
}

export interface BrandingPreset {
  name: string;
  brand_color: string;
  accent_color: string;
}

export interface BrandingAdmin {
  account_uid: string;
  name: string;
  username: string;
  role: string | null;
}

export interface ClientBranding {
  client_uid: string;
  control: BrandingControl;
  look: BrandingLook;
  /** What the client chose; null = the default. */
  saved: { brand_color: string | null; accent_color: string | null; assistant_name: string | null };
  admins: BrandingAdmin[];
  defaults: { brand_color: string; accent_color: string; assistant_name: string; presets: BrandingPreset[] };
  controlled_by: string | null;
  controlled_at: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

/** Fields sent to change a client's look; "" puts a field back to the default. */
export interface BrandingLookFields {
  brand_color?: string;
  accent_color?: string;
  assistant_name?: string;
}
