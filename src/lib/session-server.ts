import { cookies } from "next/headers";
import type { Session } from "@/lib/types";

const COOKIE_NAME = "dorm_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie)) as NonNullable<Session>;
    if (parsed?.role && parsed?.id) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function sessionCookieHeader(session: NonNullable<Session>): string {
  const value = encodeURIComponent(JSON.stringify(session));
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}
