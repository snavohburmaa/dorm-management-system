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
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
        {initials(label)}
      </div>
      <div>
        <div className="text-sm font-semibold leading-5">{label}</div>
        <div className="text-xs text-zinc-500">{sub}</div>
      </div>
    </div>
  );
}

