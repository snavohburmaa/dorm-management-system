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

