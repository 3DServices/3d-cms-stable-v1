/**
 * waswa.types.ts — Waswa AI assistant and AI Console (navas-core-apis, Phase A).
 *
 * Shapes returned by /assistant/chat, /assistant/feedback and
 * /assistant/console/*. Server field names are kept as-is.
 */

export type WaswaSurface = "mobile" | "cms" | "console";
export type WaswaVerdict = "wrong" | "unhelpful" | "good";
export type WaswaAudience = "staff" | "everyone";
export type WaswaAnswerStatus = "draft" | "pending" | "approved" | "rejected" | "retired";
export type WaswaQueueKind = "flag" | "approval" | "recheck" | "document";

export interface WaswaEvidence {
  source_kind: string;          // account_context | tool | document | verified_answer
  source_ref: string;
  authority_level: number | null;
}

export interface WaswaVerifiedRef {
  answer_uid: string;
  question: string;
  approved_at: string | null;
  matched_on: string;
}

export interface WaswaChatRequest {
  message: string;
  surface?: WaswaSurface;
  conversation_uid?: string | null;
}

export interface WaswaChatReply {
  reply: string;
  model: string | null;
  conversation_uid: string | null;
  message_uid: string | null;
  verified_answers: WaswaVerifiedRef[];
  audience?: WaswaAudience;
  evidence: WaswaEvidence[];
  intent?: string;
  truncated?: boolean;
}

export interface WaswaFeedbackRequest {
  message_uid: string;
  verdict: WaswaVerdict;
  note?: string;
  surface?: WaswaSurface;
}

export interface WaswaFeedbackResult {
  feedback_uid: string;
  status: string;
  verdict: WaswaVerdict;
}

export interface WaswaSummary {
  queue: Record<WaswaQueueKind, number>;
  queue_total: number;
  corrections: Partial<Record<WaswaAnswerStatus, number>>;
  last_30_days: { answers: number; feedback: Partial<Record<WaswaVerdict, number>> };
  you: { permissions: string[] };
}

export interface WaswaQueueCard {
  id: string;
  badge: "HITL" | "HIC";
  title: string;
  sub: string;
}

export interface WaswaQueueItem {
  item_kind: WaswaQueueKind;
  item_uid: string;
  badge: string;
  title: string | null;
  detail: string | null;
  note: string | null;
  surface: string | null;
  status: string;
  raised_at: string;
  message_uid: string | null;
  conversation_uid: string | null;
  card: WaswaQueueCard;
}

export interface WaswaQueue {
  items: WaswaQueueItem[];
  count: number;
  limit: number;
  offset: number;
}

export interface WaswaConversationRow {
  conversation_uid: string;
  account_uid: string;
  surface: string;
  status: string;
  started_at: string;
  last_activity_at: string;
  messages: number;
  first_question: string | null;
  flags: number;
}

export interface WaswaMessageFeedback {
  feedback_uid: string;
  by: string;
  verdict: WaswaVerdict;
  note: string | null;
  status: string;
  resolution: string | null;
  at: string;
}

export interface WaswaMessage {
  message_uid: string;
  turn_index: number;
  role: "user" | "assistant";
  content: string;
  intent: string | null;
  router_tier: number | null;
  model: string | null;
  prompt_version: number | null;
  blocked_reason: string | null;
  latency_ms: number | null;
  created_at: string;
  evidence: WaswaEvidence[];
  feedback: WaswaMessageFeedback[];
}

export interface WaswaConversation {
  conversation_uid: string;
  account_uid: string;
  surface: string;
  status: string;
  started_at: string;
  last_activity_at: string;
  messages: WaswaMessage[];
}

export interface WaswaDecision {
  by: string;
  decision: "approve" | "reject";
  note: string | null;
  at: string;
}

export interface WaswaAnswer {
  answer_uid: string;
  question: string;
  question_variants: string | null;
  answer: string;
  audience: WaswaAudience;
  country_scope: string | null;
  product_uid: string | null;
  sensitivity: "routine" | "policy";
  approvals_required: number;
  status: WaswaAnswerStatus;
  version: number;
  supersedes_answer_uid: string | null;
  source_feedback_uid: string | null;
  source_message_uid: string | null;
  based_on_source_uid: string | null;
  based_on_note: string | null;
  authored_by: string;
  submitted_at: string | null;
  approved_at: string | null;
  retired_at: string | null;
  retired_by: string | null;
  retired_reason: string | null;
  review_due: string | null;
  needs_recheck: boolean;
  recheck_reason: string | null;
  match_count: number;
  last_matched_at: string | null;
  created_at: string;
  updated_at: string;
  decisions?: WaswaDecision[];
  approvals?: number;
  score?: number;
  matched_on?: string;
}

export interface WaswaAnswerInput {
  question?: string;
  question_variants?: string;
  answer?: string;
  audience?: WaswaAudience;
  country_scope?: string;
  based_on_source_uid?: string;
  based_on_note?: string;
  review_due?: string;
  feedback_uid?: string;
  sensitivity?: "routine" | "policy";
}

export interface WaswaSource {
  source_uid: string;
  title: string;
  document_type: string | null;
  authority_level: number;
  review_status: "pending" | "approved" | "rejected";
  audience: WaswaAudience;
  chunk_count: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  ingested_at: string;
  superseded_by: string | null;
}

export type WaswaResolution = "correction" | "document" | "data_fix" | "dismissed";
