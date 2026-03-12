/**
 * api/client.ts — Centralised HTTP client for NAVAS CMS.
 *
 * Thin wrapper around native `fetch` that handles:
 *  - Base URL resolution (from VITE_API_BASE_URL env var)
 *  - JSON content-type headers
 *  - Auth token injection
 *  - Generic ApiResponse<T> envelope parsing
 *  - Consistent error handling via ApiError
 *
 * Public surface:  get · getRaw · post · put · patch · del
 */

import type { ApiResponse, RequestOptions } from "./types";
import { ApiError } from "./types";

// ── Base URL ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Auth helper (placeholder) ────────────────────────────────────────────────

/**
 * Returns the current auth token (account_uid from the session cookie),
 * or `null` if the user isn't authenticated.
 */
function getAuthToken(): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("_nvxs_account_uid="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// ── Shared fetch logic ───────────────────────────────────────────────────────

async function baseFetch(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<Response> {
  const { params, headers: extraHeaders, ...fetchOpts } = opts;

  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url.toString(), {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    ...fetchOpts,
  });
}

// ── Envelope request (expects { data, message, status }) ─────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const response = await baseFetch(method, path, body, opts);

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      `${method} ${path} — failed to parse response`,
      response.status,
      response.statusText,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      json.message ?? `${method} ${path} failed`,
      response.status,
      response.statusText,
      json.message,
    );
  }

  if (json.status !== "success") {
    throw new ApiError(
      json.message ?? "Request failed",
      response.status,
      response.statusText,
      json.message,
    );
  }

  return json;
}

// ── Raw request (no envelope) ────────────────────────────────────────────────

/**
 * Returns the JSON body directly without expecting the
 * `{ data, message, status }` envelope.
 * Use for endpoints that return raw payloads (e.g. /metrics/server).
 */
async function requestRaw<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const response = await baseFetch(method, path, body, opts);

  let json: T;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      `${method} ${path} — failed to parse response`,
      response.status,
      response.statusText,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `${method} ${path} failed`,
      response.status,
      response.statusText,
    );
  }

  return json;
}

// ── Public helpers ───────────────────────────────────────────────────────────

export function get<T>(path: string, opts?: RequestOptions) {
  return request<T>("GET", path, undefined, opts);
}

export function getRaw<T>(path: string, opts?: RequestOptions) {
  return requestRaw<T>("GET", path, undefined, opts);
}

export function post<T>(path: string, body: unknown, opts?: RequestOptions) {
  return request<T>("POST", path, body, opts);
}

export function put<T>(path: string, body: unknown, opts?: RequestOptions) {
  return request<T>("PUT", path, body, opts);
}

export function patch<T>(path: string, body: unknown, opts?: RequestOptions) {
  return request<T>("PATCH", path, body, opts);
}

export function del<T>(path: string, body?: unknown, opts?: RequestOptions) {
  return request<T>("DELETE", path, body, opts);
}
