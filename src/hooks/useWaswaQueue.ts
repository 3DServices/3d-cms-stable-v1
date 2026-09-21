/**
 * useWaswaQueue — the Waswa review queue for badges and the triage blade.
 *
 * Reads GET /assistant/console/queue (the oldest `limit` items) and
 * /assistant/console/summary (the true total), and returns the cards in the shape
 * WaswaTriagePanel already renders (AiQueueItem). Refreshes every
 * `intervalMs` (default 60s).
 *
 * A 403 is not an error here: it means this person does not hold
 * waswa.review, so `allowed` is false and the panel shows nothing to do.
 */
import { useCallback, useEffect, useState } from "react";
import { getWaswaQueue, getWaswaSummary } from "../api/services/waswa.service";
import type { WaswaQueueItem } from "../api/types";

export interface WaswaQueueState {
  items:   WaswaQueueItem[];
  count:   number;
  allowed: boolean;
  loading: boolean;
  error:   string | null;
  refresh: () => void;
}

export function useWaswaQueue(limit = 8, intervalMs = 60_000): WaswaQueueState {
  const [items,   setItems]   = useState<WaswaQueueItem[]>([]);
  const [count,   setCount]   = useState(0);
  const [allowed, setAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refresh = useCallback(() => {
    Promise.all([getWaswaQueue(undefined, limit), getWaswaSummary()])
      .then(([queue, summary]) => {
        setItems(queue.data.items);
        setCount(summary.data.queue_total);
        setAllowed(true);
        setError(null);
      })
      .catch((err: { status?: number; message?: string }) => {
        if (err?.status === 403) {
          setAllowed(false);
          setItems([]);
          setCount(0);
        } else {
          setError(err?.message ?? "Could not load the Waswa queue");
        }
      })
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    refresh();
    if (!intervalMs) return;
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [refresh, intervalMs]);

  return { items, count, allowed, loading, error, refresh };
}
