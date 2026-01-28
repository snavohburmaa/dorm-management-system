"use client";

import { useMemo } from "react";
import { useDorm } from "@/lib/store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function UserBadge() {
  const { session, users } = useDorm();

  const user = useMemo(() => {
    if (session?.role !== "user") return null;
    return users.find((u) => u.id === session.id) ?? null;
  }, [session, users]);

  const label = user?.name?.trim() || "User";
  const sub =
    user && (user.building || user.floor || user.room)
      ? `${user.building || "—"} • Floor ${user.floor || "—"} • Room ${user.room || "—"}`
      : "Dorm portal";

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-950 text-xs font-semibold text-white sm:size-10 sm:rounded-2xl sm:text-sm">
        {initials(label)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5">{label}</div>
        <div className="truncate text-xs text-zinc-500">{sub}</div>
      </div>
    </div>
  );
}

