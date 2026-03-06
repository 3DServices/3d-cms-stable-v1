/**
 * clients.types.ts — Types for the Clients API.
 */

export interface Client {
  client_uid:   string;
  client_name:  string;
  client_email: string;
}

export interface CreateClientRequest {
  client_name:  string;
  client_email: string;
  client_owner: string;
}

export interface ClientDevice {
  device_imei:          string;
  device_name:          string;
  simcard:              string;
  simcard_uid:          string;
  car_make:             string;
  car_model:            string;
  vin_number:           string;
  car_type:             string;
  events_attached:      string;
  billing_status:       string;
  subscription_status:  string;
  client_uid:           string;
  client_name:          string;
  hardware:             string;
  hardware_model:       string;
}

// ── Unit statistics ──────────────────────────────────────────────────────────

export interface OnlineUnit {
  device_imei:          string;
  device_name:          string;
  client_uid:           string;
  client_name:          string;
  last_seen_timestamp:  string;
  last_seen_datestamp:   string;
  status:               string;
}

export interface OnlineUnitsResponse {
  count:                    number;
  total_configured_units:   number;
  criteria:                 string;
  units:                    OnlineUnit[];
}

export interface OfflineUnitsResponse {
  count:                    number;
  total_configured_units:   number;
  criteria:                 string;
  units:                    OnlineUnit[];  // same shape as online
}

export interface ExpiredSubscription {
  token_billing_uid:  string;
  client_uid:         string;
  client_name:        string;
  token_id:           string;
  token_name:         string;
  token_type:         string;
  token_status:       string;
  token_hours_left:   number;
  token_hours_used:   number;
  token_currency:     string;
}

export interface ExpiredTokensResponse {
  count:          number;
  subscriptions:  ExpiredSubscription[];
}
