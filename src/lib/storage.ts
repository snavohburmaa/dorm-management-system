const PREFIX = "dm:";

export function storageKey(key: string) {
  return `${PREFIX}${key}`;
}

export function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(storageKey(key));
  const parsed = safeParseJson<T>(raw);
  return parsed ?? fallback;
}

export function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(key), JSON.stringify(value));
}

export function remove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(key));
}

