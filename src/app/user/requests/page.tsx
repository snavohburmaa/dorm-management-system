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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Maintenance Request List
        </h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "current" ? "primary" : "secondary"}
            size="sm"
            type="button"
            onClick={() => setFilter("current")}
          >
            Current
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "secondary"}
            size="sm"
            type="button"
            onClick={() => setFilter("all")}
          >
            All (History)
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <p className="text-sm text-zinc-600">
            {filter === "current"
              ? "Requests that are pending or in progress."
              : "All your maintenance requests, including completed."}
          </p>
          {myRequests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
              No requests found.
              <br />
              <Link
                href="/user/profile"
                className="mt-2 inline-block font-semibold text-zinc-900 underline underline-offset-2"
              >
                Report an issue from Profile
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {myRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{r.title}</div>
                      <div className="mt-2 text-sm text-zinc-700">{r.description}</div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone={toneForStatus(r.status)}>
                          {r.status.replaceAll("_", " ")}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          Created: {formatDateTime(r.createdAt)}
                        </span>
                      </div>
                      {r.technicianNotes ? (
                        <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                          <span className="font-semibold text-zinc-600">Technician notes: </span>
                          {r.technicianNotes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-start">
        <Link
          href="/user/announcements"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
        >
          ← Back to Announcements
        </Link>
      </div>
    </div>
  );
}
