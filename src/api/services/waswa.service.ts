/**
 * waswa.service.ts — Waswa AI assistant + AI Console (navas-core-apis).
 *
 * Chat (any signed-in user):
 *   POST /assistant/chat                              → sendWaswaMessage
 *   POST /assistant/feedback                          → sendWaswaFeedback
 *
 * Console (waswa.review; decide/confirm/source changes need waswa.approve):
 *   GET  /assistant/console/summary                   → getWaswaSummary
 *   GET  /assistant/console/queue                     → getWaswaQueue
 *   GET  /assistant/console/conversations             → getWaswaConversations
 *   GET  /assistant/console/conversations/{uid}       → getWaswaConversation
 *   GET  /assistant/console/answers                   → listWaswaAnswers
 *   POST /assistant/console/answers                   → createWaswaAnswer
 *   GET  /assistant/console/answers/{uid}             → getWaswaAnswer
 *   POST /assistant/console/answers/{uid}             → updateWaswaAnswer
 *   POST /assistant/console/answers/{uid}/submit      → submitWaswaAnswer
 *   POST /assistant/console/answers/{uid}/decide      → decideWaswaAnswer
 *   POST /assistant/console/answers/{uid}/confirm     → confirmWaswaAnswer
 *   POST /assistant/console/answers/{uid}/retire      → retireWaswaAnswer
 *   POST /assistant/console/feedback/{uid}/resolve    → resolveWaswaFeedback
 *   GET  /assistant/console/sources                   → getWaswaSources
 *   POST /assistant/console/sources/{uid}/review      → reviewWaswaSource
 *   POST /assistant/console/sources/{uid}/audience    → setWaswaSourceAudience
 *   GET  /assistant/console/match                     → previewWaswaMatch
 *
 * The backend reads the caller's role from the JWT; nothing here sends a role
 * or permission. Every write body is wrapped in { data: ... } per convention.
 */

import { get, post } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type {
  WaswaAnswer,
  WaswaAnswerInput,
  WaswaAudience,
  WaswaChatReply,
  WaswaChatRequest,
  WaswaConversation,
  WaswaConversationRow,
  WaswaFeedbackRequest,
  WaswaFeedbackResult,
  WaswaQueue,
  WaswaQueueKind,
  WaswaResolution,
  WaswaSource,
  WaswaSummary,
} from "../types";

const W = ENDPOINTS.WASWA;
const enc = encodeURIComponent;

// ── Chat ─────────────────────────────────────────────────────────────────────

export function sendWaswaMessage(
  req: WaswaChatRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaChatReply>> {
  return post<WaswaChatReply>(W.CHAT, { data: { surface: "cms", ...req } }, opts);
}

export function sendWaswaFeedback(
  req: WaswaFeedbackRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaFeedbackResult>> {
  return post<WaswaFeedbackResult>(W.FEEDBACK, { data: { surface: "cms", ...req } }, opts);
}

// ── Console: overview ────────────────────────────────────────────────────────

export function getWaswaSummary(opts?: RequestOptions): Promise<ApiResponse<WaswaSummary>> {
  return get<WaswaSummary>(W.SUMMARY, opts);
}

export function getWaswaQueue(
  kinds?: WaswaQueueKind[],
  limit = 50,
  offset = 0,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaQueue>> {
  const params: Record<string, string> = { limit: String(limit), offset: String(offset) };
  if (kinds?.length) params.kind = kinds.join(",");
  return get<WaswaQueue>(W.QUEUE, { ...opts, params });
}

export function getWaswaConversations(
  filters: { surface?: string; flagged?: boolean; limit?: number; offset?: number } = {},
  opts?: RequestOptions,
): Promise<ApiResponse<{ conversations: WaswaConversationRow[] }>> {
  const params: Record<string, string> = {};
  if (filters.surface) params.surface = filters.surface;
  if (filters.flagged) params.flagged = "true";
  if (filters.limit != null) params.limit = String(filters.limit);
  if (filters.offset != null) params.offset = String(filters.offset);
  return get(W.CONVERSATIONS, { ...opts, params });
}

export function getWaswaConversation(
  conversationUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaConversation>> {
  return get<WaswaConversation>(`${W.CONVERSATIONS}/${enc(conversationUid)}`, opts);
}

// ── Console: corrections ─────────────────────────────────────────────────────

export function listWaswaAnswers(
  filters: { status?: string; q?: string; limit?: number; offset?: number } = {},
  opts?: RequestOptions,
): Promise<ApiResponse<{ answers: WaswaAnswer[] }>> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.q) params.q = filters.q;
  if (filters.limit != null) params.limit = String(filters.limit);
  if (filters.offset != null) params.offset = String(filters.offset);
  return get(W.ANSWERS, { ...opts, params });
}

export function getWaswaAnswer(answerUid: string, opts?: RequestOptions): Promise<ApiResponse<WaswaAnswer>> {
  return get<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}`, opts);
}

export function createWaswaAnswer(input: WaswaAnswerInput, opts?: RequestOptions): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(W.ANSWERS, { data: input }, opts);
}

/** Edits a draft in place; editing an approved answer returns a NEW version (new answer_uid). */
export function updateWaswaAnswer(
  answerUid: string,
  input: WaswaAnswerInput,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}`, { data: input }, opts);
}

export function submitWaswaAnswer(answerUid: string, opts?: RequestOptions): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}/submit`, { data: {} }, opts);
}

export function decideWaswaAnswer(
  answerUid: string,
  decision: "approve" | "reject",
  note?: string,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}/decide`, { data: { decision, note } }, opts);
}

export function confirmWaswaAnswer(
  answerUid: string,
  reviewDue?: string,
  note?: string,
  opts?: RequestOptions,
): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}/confirm`, { data: { review_due: reviewDue, note } }, opts);
}

export function retireWaswaAnswer(answerUid: string, reason: string, opts?: RequestOptions): Promise<ApiResponse<WaswaAnswer>> {
  return post<WaswaAnswer>(`${W.ANSWERS}/${enc(answerUid)}/retire`, { data: { reason } }, opts);
}

export function resolveWaswaFeedback(
  feedbackUid: string,
  resolution: WaswaResolution,
  note?: string,
  answerUid?: string,
  opts?: RequestOptions,
): Promise<ApiResponse<{ feedback_uid: string; resolution: WaswaResolution }>> {
  return post(`${W.FEEDBACK_RESOLVE}/${enc(feedbackUid)}/resolve`,
    { data: { resolution, note, answer_uid: answerUid } }, opts);
}

// ── Console: documents ───────────────────────────────────────────────────────

export function getWaswaSources(opts?: RequestOptions): Promise<ApiResponse<{ sources: WaswaSource[] }>> {
  return get(W.SOURCES, opts);
}

export function reviewWaswaSource(
  sourceUid: string,
  decision: "approve" | "reject" | "pending",
  note?: string,
  opts?: RequestOptions,
): Promise<ApiResponse<{ source_uid: string; title: string; review_status: string }>> {
  return post(`${W.SOURCES}/${enc(sourceUid)}/review`, { data: { decision, note } }, opts);
}

export function setWaswaSourceAudience(
  sourceUid: string,
  audience: WaswaAudience,
  opts?: RequestOptions,
): Promise<ApiResponse<{ source_uid: string; title: string; audience: WaswaAudience }>> {
  return post(`${W.SOURCES}/${enc(sourceUid)}/audience`, { data: { audience } }, opts);
}

export function previewWaswaMatch(
  q: string,
  audience: WaswaAudience = "staff",
  opts?: RequestOptions,
): Promise<ApiResponse<{ query: string; audience: WaswaAudience; matches: WaswaAnswer[] }>> {
  return get(W.MATCH, { ...opts, params: { q, audience } });
}
