/**
 * clients.service.ts — Clients API service.
 *
 * Endpoints:
 *   POST /clients/create                    → createClient
 *   GET  /clients/all                       → getAllClients
 *   GET  /clients/{service_provider}/all    → getClientsByProvider
 *   GET  /devices/configured/{client_uid}/client → getClientDevices
 */

import { get, post } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type { Client, ClientDevice, CreateClientRequest } from "../types";

/** Create a new client. */
export function createClient(
  payload: CreateClientRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<string>> {
  return post<string>(ENDPOINTS.CLIENTS.CREATE, { data: payload }, opts);
}

/** Fetch all clients. */
export function getAllClients(
  opts?: RequestOptions,
): Promise<ApiResponse<Client[]>> {
  return get<Client[]>(ENDPOINTS.CLIENTS.GET_ALL, opts);
}

/** Fetch clients filtered by service provider. */
export function getClientsByProvider(
  serviceProvider: string,
  opts?: RequestOptions,
): Promise<ApiResponse<Client[]>> {
  return get<Client[]>(`${ENDPOINTS.CLIENTS.BY_PROVIDER}/${serviceProvider}/all`, opts);
}

/** Fetch configured devices belonging to a specific client. */
export function getClientDevices(
  clientUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ClientDevice[]>> {
  return get<ClientDevice[]>(`${ENDPOINTS.CLIENTS.DEVICES}/${clientUid}/client`, opts);
}
