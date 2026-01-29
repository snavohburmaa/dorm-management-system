import type { Session } from "@/lib/types";

const COOKIE_NAME = "dorm_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setSessionCookie(session: NonNullable<Session>): void {
  const value = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function getSessionFromCookie(cookieHeader: string | null): Session {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1] ?? "")) as NonNullable<Session>;
    if (parsed?.role && parsed?.id) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function clearSessionCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
