"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

type Filter = "current" | "all";

export default function UserRequestsPage() {
  const { requests, session } = useDorm();
  const [filter, setFilter] = useState<Filter>("current");

  const myRequests = useMemo(() => {
    if (session?.role !== "user") return [];
    const list = requests.filter((r) => r.userId === session.id);
    if (filter === "current") {
      return list.filter((r) => r.status === "pending" || r.status === "in_progress");
    }
    return list;
  }, [requests, session, filter]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="anim-enter flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Maintenance Requests
        </h1>
        <div className="inline-flex gap-1.5 rounded-2xl border border-zinc-200/80 bg-white/80 p-1 [box-shadow:var(--shadow-sm)]">
          <Button
            variant={filter === "current" ? "primary" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setFilter("current")}
          >
            Current
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setFilter("all")}
          >
            All history
          </Button>
        </div>
      </div>

      {myRequests.length === 0 ? (
        <div className="anim-enter delay-100 rounded-3xl border border-zinc-200/70 bg-white p-10 text-center [box-shadow:var(--shadow-sm)]">
          <p className="text-sm font-medium text-zinc-500">No requests found.</p>
          <Link
            href="/user/profile"
            className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.18)] hover:bg-zinc-800"
          >
            Report an issue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.map((r, i) => (
            <div
              key={r.id}
              className="anim-enter rounded-3xl border border-zinc-200/70 bg-white p-4 sm:p-5 [box-shadow:var(--shadow-md)]
                transition-all duration-300 hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lg)]"
              style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.title}</div>
                  <div className="mt-1.5 text-sm leading-relaxed text-zinc-600">{r.description}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone={toneForStatus(r.status)}>
                      {r.status.replaceAll("_", " ")}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {formatDateTime(r.createdAt)}
                    </span>
                    {r.preferredAt ? (
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200/60" suppressHydrationWarning>
                        Preferred: {formatDateTime(r.preferredAt)}
                      </span>
                    ) : null}
                  </div>
                  {r.technicianNotes ? (
                    <div className="mt-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-700">
                      <span className="font-semibold text-zinc-500">Technician: </span>
                      {r.technicianNotes}
                    </div>
                  ) : null}
                  {r.status !== "complete" ? (
                    <Link
                      href={`/user/requests/${r.id}/chat`}
                      className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700
                        transition-all duration-200 hover:bg-zinc-100 hover:[box-shadow:var(--shadow-sm)]"
                    >
                      <span>Message technician</span>
                      <span className="text-zinc-400">→</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
