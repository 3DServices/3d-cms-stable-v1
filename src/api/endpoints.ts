/**
 * api/endpoints.ts — Central registry of all API URL paths.
 *
 * Every endpoint in the app is defined here. When a URL changes,
 * update it in one place and every service picks it up.
 *
 * Convention:
 *   DOMAIN.ACTION  →  "/path/to/endpoint"
 */

export const ENDPOINTS = {
  SIMCARDS: {
    CREATE:  "/devices/simcards/create",
    GET_ALL: "/devices/simcards/all",
  },
  STATISTICS: {
    SIMS_SUMMARY:        "/statistics/sims/summary",
    UNITS_ONLINE:        "/statistics/units/online",
    UNITS_OFFLINE:       "/statistics/units/offline",
    TOKENS_EXPIRED:      "/statistics/tokens/expired",
    TOKENS_ACTIVE:       "/statistics/tokens/active",
    TOKENS_PAUSED:       "/statistics/tokens/paused",
    HIGH_SUB_CLIENTS:    "/statistics/clients/high-subscriptions",
    VEBA_UNITS_ENABLED:  "/statistics/veba/units/enabled",
    VEBA_UNITS_DISABLED: "/statistics/veba/units/disabled",
    VEBA_TOKENS_ACTIVE:  "/statistics/veba/tokens/active",
    VEBA_TOKENS_EXPIRED: "/statistics/veba/tokens/expired",
  },
  BILLING: {
    CHURN_RATE:       "/billing/subscriptions/churn-rate",
    EXPIRING:         "/billing/subscriptions/expiring",   // ?days=30
  },
  PAYMENTS: {
    TRANSACTIONS:     "/payments/transactions",            // append /{client_uid}/list
  },
  METRICS: {
    SERVER:          "/metrics/server",
    API_PERFORMANCE: "/metrics/api/performance",
    //STATISTICS: "/veba/statistics",
  },
  GATEWAYS: {
    MOBILE_MONEY:     "/gateways/mobile-money",
    MOBILE_MONEY_BY:  "/gateways/mobile-money",   // append /{telecom_name}
    UPDATE:           "/gateways/mobile-money/update",
  },
  VEBA: {
    STATISTICS:       "/veba/statistics",
    LISTINGS:         "/veba/listings",             // GET /{account_root}
    LISTINGS_CREATE:  "/veba/listings/create",      // POST
    LISTINGS_UPDATE:  "/veba/listings",             // PUT /{listing_uid}/update
    LISTINGS_PAUSE:   "/veba/listings",             // PUT /{listing_uid}/pause
    LISTINGS_REACTIVATE: "/veba/listings",          // PUT /{listing_uid}/reactivate
    LISTINGS_ARCHIVE: "/veba/listings",             // PUT /{listing_uid}/archive
    BOOKING_REQUESTS: "/veba/booking-requests",     // GET /{account_root}
    BOOKING_CREATE:   "/veba/booking-requests/create", // POST
    BOOKING_APPROVE:  "/veba/booking-requests",     // PUT /{uid}/approve
    BOOKING_REJECT:   "/veba/booking-requests",     // PUT /{uid}/reject
    BOOKING_CANCEL:   "/veba/booking-requests",     // PUT /{uid}/cancel
    BOOKING_FULFILL:  "/veba/booking-requests",     // PUT /{uid}/fulfill
    MARKETPLACE:      "/veba/marketplace/listings", // GET public marketplace
  },
  TENANTS: {
    CREATE:          "/tenants/create",
    GET_ALL:         "/tenants/all",
    IMPORT:          "/tenants/import",
    IMPORT_TEMPLATE: "/tenants/import/template",
    TRASH:           "/tenants",           // append /{id}/trash
    RESTORE:         "/tenants",           // append /{id}/restore
    GET_TRASHED:     "/tenants/trashed",
    KPIS:            "/tenants/kpis",
    WALLET:          "/tenants",           // append /{id}/wallet
    TOP_UP:          "/tenants/wallet/topup",
    ALLOCATE:        "/tenants/wallet/allocate",
    MINT:            "/tenants/wallet/mint",
    USAGE_EVENTS:    "/tenants/usage-events",
    APPROVALS:       "/tenants/approvals",
    APPROVE:         "/tenants/approvals",   // append /{id}/approve
    REJECT:          "/tenants/approvals",   // append /{id}/reject
    AUDIT_TRAIL:     "/tenants/audit-trail",
    DRAFTS:          "/tenants/drafts",           // POST save draft
    DRAFT_APPROVAL:  "/tenants/drafts",           // append /{id}/request-approval
    DRAFT_SUBMIT:    "/tenants/drafts",           // append /{id}/submit
  },
  CLIENTS: {
    CREATE:      "/clients/create",
    GET_ALL:     "/clients/all",
    BY_PROVIDER: "/clients",           // append /{service_provider}/all
    DEVICES:     "/devices/configured",// append /{client_uid}/client
    UPDATE:      "/clients",           // append /{client_uid}/update
    TRASH:       "/clients",           // append /{client_uid}/trash
    RESTORE:     "/clients",           // append /{client_uid}/restore
    GET_TRASHED: "/clients/trashed",
  },
  TOKENS: {
    GET_ALL:   "/tokens",
    CREATE:    "/tokens/create",
    BY_ID:     "/tokens",              // append /{token_id}
    BUY:       "/payments/tokens/buy",
    AUTHORIZE: "/tokens/special/authorize",
    TRANSFER:  "/tokens/transfer",
    BALANCE:   "/tokens",              // append /{client_uid}/balance
  },
  FINANCE: {
    PAYMENTS: "/finance/payments",
  },
  PORTS: {
    ACTIVITY: "/ports/activity",
  },
  RBAC: {
    ROLES:              "/rbac/roles",
    ROLES_CREATE:       "/rbac/roles/create",
    ROLES_BY_UID:       "/rbac/roles",           // append /{role_uid}
    ROLES_UPDATE:       "/rbac/roles",           // append /{role_uid}/update
    ROLES_DELETE:       "/rbac/roles",           // append /{role_uid}/delete
    PERMISSIONS:        "/rbac/permissions",
    PERMISSIONS_CREATE: "/rbac/permissions/create",
    PERMISSIONS_UPDATE: "/rbac/permissions",        // append /{permission_uid}/update
    PERMISSIONS_DELETE: "/rbac/permissions",        // append /{permission_uid}/delete
    USER_PERMISSIONS:   "/rbac/users",           // append /{account_uid}/permissions
    STATS_ACTIVE_ROLES:      "/rbac/stats/active-roles",
    STATS_TOTAL_PERMISSIONS: "/rbac/stats/total-permissions",
    STATS_ACTIVE_CLIENTS:    "/rbac/stats/active-clients",
    STATS_ACTIVE_3D_CLIENTS: "/rbac/stats/active-3d-clients",
    STATS_CLIENT_USERS:      "/rbac/stats/client-users",
    STATS_ROLE_USER_COUNTS:  "/rbac/stats/role-user-counts",
    STATS_PERM_ROLE_COUNTS:  "/rbac/stats/permission-role-counts",
  },
  AUTH: {
    LOGIN:          "/users/auth",
    MFA_VERIFY:     "/auth/mfa/verify",
    MFA_RESEND:     "/auth/mfa/resend",
    REFRESH:        "/auth/refresh",
    LOGOUT:         "/auth/logout",
    FORGOT_PASSWORD:"/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    USER_DETAILS:   "/users",              // append /{account_uid}/details
  },
  USERS: {
    CREATE: "/users/create",
    ALL: "/users/all",
    ASSIGN_ROLE: "/users",           // append /{user_uid}/assign-role
  },

  FLEET: {
    LIST_UNITS:       "/system32/devices/configured/all",  // POST {data:{data_level,account_uid}}
    CHECK_IMEI:       "/subscriptions/device/status",        // POST {data:{device_imei}}
    CLIENTS_ALL:      "/clients",                          // GET  append /{primary_uid}/all
    USER_DETAILS:     "/users",                            // GET  append /{account_uid}/details
    DEVICE_ACTION:    "/devices/action",                   // POST {data:{action,device_imei}}
    DEVICE_UPDATE:    "/devices/update/properties",        // POST {data:{device_imei,...props}}
    DEVICE_CFG_NEW:   "/system32/configurations/new",      // POST full config payload
    DEVICE_CFG_UPDATE:"/configurations/update",            // POST Teltonika update payload
    ACTIVE_TXNS:      "/system32/payment/transactions/active", // GET append /{userUid}
    UPDATE_IMEI:      "/system32/payment/update-imei",     // POST {data:{payment_uid,used_imei}}
    LIST_REGISTERED:  "/devices/all",           // POST {data:{data_level,account_uid}}
    REGISTER_UNIT:    "/devices/create",
    DEVICE_SUB_RENEW: "/subscriptions/device/renew", // POST {data:{device_imei,token_billing_uid}}
  },

  PRODUCTS: {
    LIST:           "/billing/products/list",
    CREATE:         "/billing/products/create",
    UPDATE:         "/billing/products/update",
    DELETE:         "/billing/products/delete",
    VARIANT_LIST:   "/billing/products/variant/list",   // append /{product_uid}
    VARIANT_CREATE: "/billing/products/variant/create",
    VARIANT_UPDATE: "/billing/products/variant/update",
    VARIANT_DELETE: "/billing/products/variant/delete",
  },

  AUDIT: {
    /** CMS-wide audit event stream (all modules). Supports ?domain=&severity=&range= query params */
    EVENTS:         "/audit/events",
    /** Aggregated KPI summary for audit dashboard */
    KPIS:           "/audit/kpis",
    /** Hash-chain blocks for tamper evidence */
    HASH_CHAIN:     "/audit/hash-chain",
    /** HITL / HIC approval queue (cross-module) */
    APPROVALS:      "/audit/approvals",
    /** Approve a pending approval */
    APPROVE:        "/audit/approvals",      // append /{id}/approve
    /** Reject a pending approval */
    REJECT:         "/audit/approvals",      // append /{id}/reject
    /** Compliance snapshot (retention, crypto, gaps) */
    COMPLIANCE:     "/audit/compliance",
    /** Request an audit pack export (HIC-gated) */
    EXPORT:         "/audit/export",
  },
} as const;
