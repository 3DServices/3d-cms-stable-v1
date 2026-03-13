/**
 * useSessionMonitor Hook
 *
 * Event-driven session monitoring. Listens for:
 *   - visibilitychange (tab focus) — revalidates session on return
 *   - storage events — syncs logout across browser tabs
 *   - 401 interceptor in API client handles expired tokens automatically
 */
import { useEffect } from "react";
import { startSessionMonitor } from "../api/services/auth.service";

export function useSessionMonitor() {
  useEffect(() => {
    const cleanup = startSessionMonitor();
    return cleanup;
  }, []);
}
