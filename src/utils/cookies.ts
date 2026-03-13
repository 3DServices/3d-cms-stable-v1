/**
 * utils/cookies.ts — Centralised cookie helpers for NAVAS CMS.
 *
 * All cookie read/write/erase operations should go through these functions
 * so cookie behaviour is consistent across the app.
 */

/** Read a cookie value by name, or `null` if it doesn't exist. */
export function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)",
    );
    return match ? decodeURIComponent(match.pop() || "") : null;
  } catch {
    return null;
  }
}

/**
 * Set a cookie.
 *
 * NOTE: Auth tokens should NOT be set via JS — the backend should set
 * HttpOnly cookies in its Set-Cookie response header. Use this helper
 * only for non-sensitive, UI-hint cookies (e.g. account_type, tenant name).
 */
export function setCookie(name: string, value: string, days = 30): void {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // ignore in non-browser environments
  }
}

/** Erase a cookie by setting it to expire in the past. */
export function eraseCookie(name: string): void {
  setCookie(name, "", -1);
}

/** Erase every cookie visible to JS on the current path. */
export function clearAllCookies(): void {
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  });
}
