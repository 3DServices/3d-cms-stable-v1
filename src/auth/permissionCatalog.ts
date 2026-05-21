/**
 * auth/permissionCatalog.ts — Master catalog of all permissions in NAVAS,
 * grouped by module.
 *
 * Source of truth derived from the NAVAS user stories (see
 * `uploads/navas_permissions_by_module.html`). Each module owns a list of
 * permission keys following the `can_<action>_<object>` convention.
 *
 * Consumed by:
 *   - modules.ts                              — registry + nav/route metadata
 *   - features/rbac/RoleCreator (Slice 2)     — render permission groups
 *   - scripts/seedPermissions.ts (Slice 2)    — push catalog → backend
 *
 * Do NOT rename permission keys without coordinating the backend and the seed
 * script — they are the wire-level identifiers shared with the API.
 */

export const PERMISSION_CATALOG = {
  "AI & Video": [
    "can_view_live_video_stream", "can_configure_cameras", "can_configure_video_upload_rules",
    "can_manage_video_retention_policy", "can_export_video_clips", "can_share_video_evidence",
    "can_view_video_by_role", "can_approve_video_action", "can_mask_video_data",
    "can_watermark_video_evidence", "can_redact_video_clip", "can_request_video_snapshot",
    "can_view_video_analytics", "can_configure_video_bandwidth_rules", "can_manage_video_storage_policy",
  ],
  "API & Integration Hub": [
    "can_view_api_token_burn", "can_generate_api_token", "can_revoke_api_token",
    "can_configure_mfa", "can_access_command_api", "can_configure_webhook",
    "can_view_api_call_cost", "can_manage_integration_settings",
  ],
  "Alerts & Incident Feed": [
    "can_view_alerts", "can_create_alert_rule", "can_edit_alert_rule", "can_delete_alert_rule",
    "can_suppress_alert_rule", "can_subscribe_to_alerts", "can_configure_alert_channels",
    "can_configure_alert_escalation", "can_acknowledge_alert", "can_export_alert_report",
    "can_configure_alert_quiet_hours", "can_set_alert_sensitivity_thresholds",
  ],
  "Assets & Unit Registry": [
    "can_create_unit", "can_edit_unit", "can_view_unit", "can_delete_unit", "can_archive_unit",
    "can_view_unit_health", "can_view_unit_productivity", "can_list_asset_on_marketplace",
    "can_allocate_tokens_to_asset", "can_transfer_tokens_between_assets",
    "can_configure_unit_connectivity", "can_assign_unit_to_branch", "can_bulk_manage_units",
    "can_configure_unit_depreciation", "can_view_unit_digital_twin", "can_register_unit_device",
  ],
  "Billing Plans & Invoicing": [
    "can_view_billing_plan", "can_create_billing_plan", "can_edit_billing_plan",
    "can_assign_billing_plan", "can_view_invoice", "can_create_invoice",
    "can_manage_billing_audit_trail", "can_export_billing_data",
  ],
  "Dashboards & BI Studio": [
    "can_view_dashboard", "can_create_dashboard", "can_edit_dashboard", "can_delete_dashboard",
    "can_export_report", "can_schedule_report", "can_share_report", "can_view_burnrate_dashboard",
    "can_view_bi_studio", "can_configure_kpi_cards", "can_view_compliance_dashboard",
  ],
  "Dealer Branding & White-Label": [
    "can_customize_branding", "can_manage_whitelabel_catalog", "can_create_client_account",
    "can_edit_client_account", "can_provision_apps_for_client", "can_view_client_account",
    "can_set_discount_bands", "can_manage_dealer_scope", "can_clone_account_template",
    "can_view_client_payment_status", "can_segment_client_portfolio",
  ],
  "Device Lifecycle & Firmware": [
    "can_view_device_lifecycle", "can_manage_firmware_update", "can_view_device_compatibility",
    "can_register_device_serial", "can_manage_warranty_record", "can_decommission_device",
  ],
  "Dispatch & Job Board": [
    "can_create_job", "can_edit_job", "can_view_job", "can_assign_job", "can_cancel_job",
    "can_dispatch_asset", "can_override_dispatch_block", "can_view_job_board",
    "can_reroute_job", "can_configure_dispatch_rules", "can_contact_driver_from_job",
    "can_view_job_funnel", "can_manage_yard_map",
  ],
  "Driver Scorecard": [
    "can_view_driver_scorecard", "can_configure_scorecard_weights", "can_export_driver_risk_summary",
    "can_dispute_score_event", "can_view_scorecard_leaderboard", "can_configure_scorecard_by_profile",
    "can_review_score_before_punitive_action", "can_override_score_event",
  ],
  "Drivers": [
    "can_create_driver", "can_edit_driver", "can_view_driver", "can_deactivate_driver",
    "can_assign_driver_to_asset", "can_unassign_driver_from_asset", "can_blacklist_driver",
    "can_suspend_driver", "can_reinstate_driver", "can_view_driver_safety_score",
    "can_manage_driver_documents", "can_export_driver_data", "can_bulk_manage_drivers",
    "can_view_driver_fatigue_data", "can_manage_driver_training_record",
    "can_configure_driver_coaching", "can_view_driver_compliance_status",
  ],
  "E-Shop & Bundle Builder": [
    "can_browse_eshop", "can_purchase_eshop_item", "can_manage_eshop_catalog",
    "can_create_bundle", "can_edit_bundle", "can_manage_eshop_returns",
    "can_view_bundle_recommendations", "can_configure_bundle_dependencies",
  ],
  "Fuel Triple-Audit Hub": [
    "can_view_fuel_levels", "can_issue_fuel_voucher", "can_manage_fuel_cards",
    "can_view_fuel_transactions", "can_configure_fueling_corridors", "can_authorize_fuel_dispensing",
    "can_view_fuel_efficiency_report", "can_freeze_fuel_card", "can_configure_fuel_limits",
    "can_assign_fuel_card", "can_view_fuel_audit_report", "can_manage_bulk_fuel_tanks",
    "can_export_fuel_data", "can_view_fuel_reconciliation", "can_configure_fuel_station_approvals",
  ],
  "Geo-Zones & POIs": [
    "can_create_geofence", "can_edit_geofence", "can_delete_geofence", "can_view_geofence",
    "can_create_poi", "can_edit_poi", "can_delete_poi", "can_import_geofences", "can_export_geofences",
    "can_share_geofence_externally", "can_approve_geofence_edit", "can_bulk_manage_geofences",
    "can_configure_geofence_dwell_rules", "can_apply_geofence_template", "can_view_geofence_audit_trail",
  ],
  "Goods & IoT": [
    "can_view_cargo_sensor_data", "can_create_cargo_manifest", "can_edit_cargo_manifest",
    "can_monitor_cold_chain", "can_track_cargo_custody", "can_view_cargo_seal_status",
    "can_configure_cargo_lock_geofence", "can_manage_cargo_handover", "can_view_cargo_dwell_time",
  ],
  "Helpdesk & Customer Success": [
    "can_create_support_ticket", "can_view_support_ticket", "can_manage_support_ticket",
    "can_view_support_sla_dashboard", "can_configure_helpdesk_integration",
    "can_view_customer_success_metrics", "can_escalate_ticket", "can_close_ticket",
  ],
  "Identity & Login": [
    "can_configure_2fa", "can_configure_mfa", "can_set_login_policy", "can_view_login_audit_log",
    "can_manage_trusted_devices", "can_configure_session_timeout", "can_configure_distress_pin",
    "can_configure_trust_score", "can_set_failed_attempt_threshold", "can_manage_guest_login",
    "can_configure_time_restricted_login",
  ],
  "Inspecta": [
    "can_create_inspection_template", "can_edit_inspection_template", "can_delete_inspection_template",
    "can_conduct_inspection", "can_view_inspection_record", "can_signoff_inspection",
    "can_export_inspection_report", "can_schedule_inspection", "can_override_inspection_item",
    "can_share_inspection_evidence", "can_grant_guest_inspection_access", "can_view_inspection_score",
    "can_configure_inspection_reminders", "can_reopen_inspection", "can_view_inspection_audit_trail",
  ],
  "Live Dispatch & GIS": [
    "can_view_live_gis_map", "can_view_delivery_metrics", "can_view_legislative_compliance_report",
    "can_view_live_traffic_overlay", "can_view_cost_per_delivery_metric",
  ],
  "Messaging & Notification Hub": [
    "can_view_notification_analytics", "can_configure_notification_templates",
    "can_configure_notification_channels", "can_suppress_notifications",
    "can_approve_ai_generated_message", "can_view_notification_cost", "can_configure_opt_out_rules",
    "can_monitor_notification_delivery_health",
  ],
  "Order & HGV Control": [
    "can_create_order", "can_edit_order", "can_view_order", "can_cancel_order",
    "can_approve_order_action", "can_manage_fuel_vouchers", "can_assign_job_to_cost_center",
    "can_configure_approval_workflow_for_jobs", "can_bulk_manage_orders",
  ],
  "Owner & Broker Console": [
    "can_view_fleet_tco", "can_configure_rental_rates", "can_set_fueling_limits",
    "can_view_fleet_downtime", "can_list_asset_on_marketplace", "can_view_risk_heatmap",
    "can_configure_auto_logout", "can_view_satellite_map", "can_view_asset_longevity",
  ],
  "PackageOps PASO": [
    "can_scan_parcel", "can_create_delivery_manifest", "can_edit_delivery_manifest",
    "can_view_delivery_tracking", "can_generate_pod", "can_manage_delivery_returns",
    "can_share_parcel_tracking_link", "can_flag_damaged_parcel", "can_view_parcel_audit_log",
    "can_manage_cold_chain_parcel", "can_view_delivery_cost_analytics",
  ],
  "Passengers": [
    "can_manage_passenger_boarding", "can_view_passenger_manifest", "can_manage_passenger_list",
    "can_blacklist_passenger", "can_view_passenger_safety_data", "can_share_passenger_tracking",
    "can_configure_passenger_zones", "can_view_passenger_occupancy", "can_manage_passenger_roster",
    "can_report_passenger_safety_incident", "can_configure_passenger_notifications",
  ],
  "Payments & Mobile Money": [
    "can_view_payment_status", "can_process_mobile_money_payment", "can_configure_payment_methods",
    "can_view_mobile_money_settlement", "can_view_payment_gateway_health",
    "can_manage_partial_payment", "can_export_payment_records",
  ],
  "Payments & Statements": [
    "can_view_statement", "can_download_statement", "can_manage_refunds", "can_manage_credit_notes",
    "can_approve_payment", "can_configure_auto_renew", "can_view_collections", "can_manage_dunning",
    "can_configure_consolidated_billing", "can_view_aging_buckets", "can_reconcile_payments",
    "can_manage_escrow_payment", "can_view_fx_rate_on_statement",
  ],
  "Procurement & Stock Control": [
    "can_create_rfq", "can_edit_rfq", "can_approve_rfq", "can_view_procurement_catalog",
    "can_manage_inventory", "can_configure_reorder_rules", "can_view_supplier_comparison",
    "can_manage_rma", "can_reserve_stock", "can_track_serial_inventory",
    "can_create_purchase_order", "can_approve_purchase_order", "can_view_landed_cost",
    "can_manage_compatibility_registry", "can_view_stock_levels", "can_manage_warranty_claims",
  ],
  "Reports & Alerts Studio": [
    "can_view_report", "can_create_report", "can_edit_report", "can_schedule_report",
    "can_share_report_externally", "can_export_report", "can_manage_report_recipients",
    "can_update_cost_library",
  ],
  "Resources & Template Library": [
    "can_view_resource_template", "can_create_resource_template", "can_edit_resource_template",
    "can_clone_resource_template", "can_share_resource_template", "can_inherit_resource_template",
    "can_import_resources", "can_export_resources",
  ],
  "Routes & Journey Control": [
    "can_create_route", "can_edit_route", "can_view_route", "can_delete_route", "can_assign_route",
    "can_simulate_route", "can_configure_route_restrictions", "can_apply_route_template",
    "can_manage_route_checkpoints", "can_configure_route_dwell_rules", "can_import_route",
    "can_export_route", "can_view_route_profitability", "can_configure_curfew_corridors",
  ],
  "SIM & Connectivity Guard": [
    "can_view_sim_inventory", "can_manage_sim_profile", "can_suspend_sim", "can_reactivate_sim",
    "can_view_connectivity_dashboard", "can_configure_apn", "can_create_sim_group",
    "can_view_roaming_report", "can_configure_roaming_rules", "can_view_sim_data_spend",
    "can_manage_sim_tariff", "can_view_connectivity_health", "can_approve_mass_sim_change",
  ],
  "Security & HIC Controls": [
    "can_configure_biometric_auth", "can_view_audit_log", "can_configure_rbac",
    "can_configure_acl", "can_manage_immobilizer", "can_manage_panic_controls",
    "can_configure_mfa", "can_approve_break_glass_access", "can_enforce_2fa",
    "can_manage_evidence_integrity", "can_view_security_incident", "can_configure_restricted_zones",
    "can_configure_curfew_rules", "can_generate_incident_narrative", "can_view_suspicious_login_alerts",
    "can_configure_impossible_travel_alerts", "can_revoke_all_user_sessions",
  ],
  "Sensors & Parameter Library": [
    "can_view_sensor_library", "can_create_sensor_template", "can_edit_sensor_template",
    "can_map_sensor_to_asset", "can_calibrate_sensor", "can_configure_sensor_threshold",
    "can_view_sensor_health", "can_acknowledge_sensor_alert", "can_delete_sensor_template",
    "can_view_sensor_data_quality", "can_manage_virtual_sensor", "can_configure_sensor_group_threshold",
  ],
  "Settings & Localization": [
    "can_configure_localization", "can_configure_org_defaults", "can_enable_app",
    "can_disable_app", "can_configure_approval_workflow", "can_manage_api_tokens",
    "can_configure_notification_settings", "can_manage_regional_settings",
    "can_configure_timezone", "can_configure_currency", "can_configure_measurement_units",
    "can_view_app_renewal_settings", "can_configure_ai_behavior", "can_bulk_manage_settings",
  ],
  "Staff Patrol": [
    "can_view_patrol_dashboard", "can_create_patrol_route", "can_edit_patrol_route",
    "can_configure_patrol_checkpoint", "can_view_patrol_compliance", "can_manage_distress_workflow",
    "can_configure_welfare_timer", "can_view_patrol_coverage", "can_manage_patrol_schedule",
    "can_export_patrol_data", "can_view_patrol_audit_trail",
  ],
  "Tasks & Maintenance": [
    "can_create_task", "can_edit_task", "can_view_task", "can_assign_task", "can_close_task",
    "can_cancel_task", "can_create_maintenance_interval", "can_edit_maintenance_interval",
    "can_approve_parts_requisition", "can_view_maintenance_dashboard", "can_schedule_maintenance",
    "can_export_service_history", "can_manage_service_intervals", "can_view_predictive_maintenance",
    "can_manage_job_card", "can_configure_task_templates", "can_bulk_manage_tasks",
    "can_view_workshop_kanban", "can_configure_maintenance_triggers",
  ],
  "Token Wallet & Billing": [
    "can_view_token_balance", "can_allocate_tokens", "can_topup_tokens", "can_transfer_tokens",
    "can_pause_token_consumption", "can_resume_token_consumption", "can_approve_token_override",
    "can_configure_token_caps", "can_view_billing_ledger", "can_manage_split_billing",
    "can_simulate_token_usage", "can_configure_token_fifo", "can_create_token_bundle",
    "can_edit_token_bundle", "can_view_token_burn_rate", "can_manage_emergency_topup",
    "can_approve_manual_token_allocation", "can_view_token_forecast",
  ],
  "Trailer Pairing": [
    "can_pair_trailer", "can_unpair_trailer", "can_view_trailer_pairing_history",
    "can_configure_trailer_pairing_rules",
  ],
  "Trailers": [
    "can_create_trailer", "can_edit_trailer", "can_view_trailer", "can_delete_trailer",
    "can_assign_trailer_to_route", "can_assign_trailer_to_job", "can_manage_trailer_documents",
    "can_bulk_manage_trailers", "can_manage_subcontracted_trailer", "can_view_trailer_health",
    "can_configure_trailer_sensor", "can_view_trailer_utilization",
  ],
  "Training & Knowledge Center": [
    "can_create_training_plan", "can_edit_training_plan", "can_assign_training",
    "can_view_training_record", "can_track_certification", "can_schedule_training_event",
    "can_upload_training_document", "can_configure_coaching_reminders", "can_export_training_data",
    "can_view_training_compliance", "can_configure_remedial_training_triggers",
    "can_manage_policy_acknowledgements",
  ],
  "Trip Replay & Audit": [
    "can_view_trip_replay", "can_view_trip_event_markers", "can_export_trip_data",
    "can_view_ai_audit_log", "can_impersonate_user_for_support", "can_view_audit_log",
    "can_view_fuel_reconciliation_audit", "can_configure_cinematic_playback",
    "can_view_token_audit_log", "can_view_score_override_audit_log",
  ],
  "Users & Permissions": [
    "can_create_user", "can_edit_user", "can_view_user", "can_deactivate_user", "can_delete_user",
    "can_invite_user", "can_assign_role", "can_manage_user_permissions", "can_configure_rbac",
    "can_bulk_import_users", "can_bulk_export_users", "can_review_access", "can_recertify_access",
    "can_provision_user_from_directory", "can_manage_delegated_admin", "can_reset_user_password",
    "can_view_dormant_user_report", "can_manage_branch_user",
  ],
  "VEBA Booking & Escrow": [
    "can_create_booking", "can_view_booking", "can_approve_booking", "can_reject_booking",
    "can_cancel_booking", "can_manage_escrow_payment", "can_release_escrow_funds",
    "can_configure_booking_rules", "can_view_booking_audit_trail",
  ],
  "Veba Booking": [
    "can_browse_asset_listings", "can_create_asset_listing", "can_edit_asset_listing",
    "can_book_asset", "can_approve_booking_request", "can_reject_booking_request",
    "can_manage_booking_session", "can_start_booking", "can_stop_booking",
    "can_view_booking_schedule", "can_view_booking_revenue_forecast", "can_configure_hire_rates",
    "can_configure_insurance_verification", "can_view_marketplace_dashboard",
    "can_manage_operator_assignment", "can_configure_kyc_verification",
  ],
  "Waswa AI & System Health": [
    "can_access_waswa_ai", "can_view_system_health", "can_configure_ai_automation",
    "can_approve_ai_action", "can_view_ai_audit_log", "can_configure_ai_cascade_rules",
    "can_view_billing_reconciliation", "can_query_ai_natural_language", "can_view_ai_cost",
    "can_configure_ai_approval_gates", "can_view_system_health_by_country",
    "can_view_ai_inference_health", "can_manage_ai_token_caps",
  ],
  "Workshop Garage": [
    "can_create_job_card", "can_edit_job_card", "can_view_job_card", "can_close_job_card",
    "can_approve_parts_requisition", "can_view_workshop_dashboard", "can_manage_bay_scheduling",
    "can_track_mechanic_productivity", "can_manage_outsourced_job", "can_view_mechanic_labor_time",
    "can_manage_repair_manual", "can_approve_cost_estimate", "can_configure_workshop_kanban",
    "can_view_repeat_fault_analysis", "can_manage_quality_control_checklist",
  ],
  "eShop & Solution Builder": [
    "can_browse_eshop", "can_purchase_eshop_item", "can_manage_eshop_catalog",
    "can_configure_eshop_integration", "can_manage_eshop_returns", "can_view_eshop_recommendations",
    "can_create_solution_bundle",
  ],
  "NOC & Network Operations": [
    "can_view_noc_dashboard", "can_view_system_kpis", "can_view_server_metrics",
    "can_view_gateway_status", "can_view_gateway_history", "can_retry_gateway_webhooks",
    "can_view_veba_statistics", "can_view_task_manager", "can_end_server_task",
    "can_view_hitl_queue", "can_approve_hitl_action", "can_reject_hitl_action",
    "can_simulate_hitl_action", "can_trigger_hic_override", "can_view_hitl_runbook",
    "can_mute_ai_alerts", "can_chat_with_waswa", "can_export_noc_report",
  ],
  "Ops War Room & Device Management": [
    "can_view_ops_dashboard", "can_view_device_table", "can_add_device",
    "can_edit_device_properties", "can_edit_device_configs", "can_delete_device",
    "can_register_unit", "can_renew_device_payment", "can_assign_device_client",
    "can_view_device_details", "can_view_ops_alarms", "can_acknowledge_ops_alarm",
    "can_view_ops_gateways", "can_rerun_ops_webhooks", "can_view_token_burn_chart",
    "can_set_token_cap", "can_view_ops_brief", "can_approve_ops_recommendation",
    "can_reject_ops_recommendation", "can_export_ops_brief", "can_send_ops_brief_whatsapp",
  ],
} as const satisfies Record<string, readonly string[]>;

// ── Derived types ────────────────────────────────────────────────────────────

export type CatalogModuleName = keyof typeof PERMISSION_CATALOG;

/** Union of every permission key in the catalog. */
export type PermissionKey =
  (typeof PERMISSION_CATALOG)[CatalogModuleName][number];

// ── Derived data (computed once at module load) ──────────────────────────────

/** Flat list of every permission key in the catalog. */
export const ALL_PERMISSIONS: readonly string[] = Object.values(
  PERMISSION_CATALOG,
).flat();

/** Reverse index: permission key → owning module name. */
export const PERMISSION_TO_MODULE: Readonly<Record<string, CatalogModuleName>> =
  Object.freeze(
    Object.fromEntries(
      (Object.entries(PERMISSION_CATALOG) as [CatalogModuleName, readonly string[]][])
        .flatMap(([mod, perms]) => perms.map((p) => [p, mod] as const)),
    ),
  );

/** All module names in catalog order. */
export const CATALOG_MODULE_NAMES: readonly CatalogModuleName[] = Object.keys(
  PERMISSION_CATALOG,
) as CatalogModuleName[];

/** Returns the permissions array for a given module, or [] if unknown. */
export function getCatalogPermissions(
  moduleName: CatalogModuleName | string,
): readonly string[] {
  return PERMISSION_CATALOG[moduleName as CatalogModuleName] ?? [];
}
