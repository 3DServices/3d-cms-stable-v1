/**
 * api.types.ts — Shared types for the NAVAS CMS API layer.
 */

// ── Response envelope ────────────────────────────────────────────────────────

/** Every API response is wrapped in this envelope. */
export interface ApiResponse<T> {
  data:    T;
  message: string;
  status:  string;
}

// ── Error ────────────────────────────────────────────────────────────────────

/** Thrown when a request fails at the HTTP or API level. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly apiMessage?: string,
    /** The envelope's `data` on an error, e.g. {errors: {field: message}}. */
    public readonly apiData?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Request options ──────────────────────────────────────────────────────────

/** Extends native fetch options with a typed `params` map for query strings. */
export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string>;
}
