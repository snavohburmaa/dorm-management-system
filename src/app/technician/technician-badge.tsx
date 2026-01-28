"use client";

import { useMemo } from "react";
import { useDorm } from "@/lib/store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  const first = parts[0]?.[0] ?? "T";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function TechnicianBadge() {
  const { session, technicians } = useDorm();

  const tech = useMemo(() => {
    if (session?.role !== "technician") return null;
    return technicians.find((t) => t.id === session.id) ?? null;
  }, [session, technicians]);

  const label = tech?.name?.trim() || "Technician";
  const sub = tech?.phone?.trim() ? `Phone: ${tech.phone}` : "Tasks & status";

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

