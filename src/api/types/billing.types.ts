// ── High-subscription clients ────────────────────────────────────────────────
export interface HighSubClient {
  client_uid: string;
  client_name: string;
  client_email: string;
  total_subscriptions: number;
  active_subscriptions: number;
  paused_subscriptions: number;
  expired_subscriptions: number;
}

export interface HighSubClientsResponse {
  count: number;
  clients: HighSubClient[];
}

// ── Paused subscriptions ─────────────────────────────────────────────────────
export interface PausedSubscription {
  device_imei: string;
  client_uid: string;
  client_name: string;
  client_email: string;
  subscription_status: string;
  end_date: string;
  token_billing_uid: string;
  token_id: string;
  token_name: string;
  token_type: string;
  token_currency: string;
  token_hours_left: number;
  token_hours_used: number;
}

export interface PausedSubscriptionsResponse {
  count: number;
  subscriptions: PausedSubscription[];
}

// ── Churn rate ───────────────────────────────────────────────────────────────
export interface ChurnRateResponse {
  period: string;
  active_start: number;
  active_end: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  churn_rate: number;
  retention_rate: number;
  revenue_lost_to_churn: number;
  churn_reasons: Record<string, number>;
}

// ── Expiring subscriptions ───────────────────────────────────────────────────
export interface ExpiringAccount {
  device_imei: string;
  client_uid: string;
  client_name: string;
  client_email: string;
  subscription_status: string;
  start_date: string;
  end_date: string;
  days_until_expiry: number;
  renewal_amount: number;
  token_billing_uid: string;
  token_id: string;
  token_name: string;
  token_type: string;
  token_currency: string;
  token_hours_left: number;
  token_hours_used: number;
  urgency: string;
}

export interface ExpiringSubscriptionsResponse {
  days_ahead: number;
  count: number;
  subscriptions: ExpiringAccount[];
}

// ── Active subscriptions ─────────────────────────────────────────────────────
export interface ActiveSubscription {
  device_imei: string;
  client_uid: string;
  client_name: string;
  client_email: string;
  subscription_status: string;
  end_date: string;
  token_billing_uid: string;
  token_id: string;
  token_name: string;
  token_type: string;
  token_currency: string;
  token_hours_left: number;
  token_hours_used: number;
}

export interface ActiveSubscriptionsResponse {
  count: number;
  subscriptions: ActiveSubscription[];
}

// ── Client transactions ──────────────────────────────────────────────────────
export interface ClientTransaction {
  transaction_uid: string;
  token_count: string;
  token_validity: string;
  total_cost: string;
  payment_currency: string;
  date: string;
  payment_status: string;
}
