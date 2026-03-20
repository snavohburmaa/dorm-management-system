"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import Link from "next/link";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Textarea } from "@/components/Textarea";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestPriority, RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

const PRIORITY_LABELS: Record<RequestPriority, string> = {
  urgent: "Urgent",
  medium: "Medium",
  low: "Low",
  enhancement: "Enhancement",
};

function toneForPriority(priority: RequestPriority): "warning" | "info" | "neutral" | "success" {
  if (priority === "urgent") return "warning";
  if (priority === "medium") return "info";
  return "neutral";
}

type Draft = {
  status: RequestStatus;
  notes: string;
  savedTick: number;
};

export default function TechnicianTasksPage() {
  const dorm = useDorm();
  const techId = dorm.session?.role === "technician" ? dorm.session.id : null;

  const tasks = useMemo(() => {
    if (!techId) return [];
    return dorm.requests.filter(
      (r) => r.assignedTechnicianId === techId && r.status !== "complete"
    );
  }, [dorm.requests, techId]);

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    // Ensure each task has an editable draft; keep drafts in sync after submit.
    setDrafts((prev) => {
      const next = { ...prev };
      for (const t of tasks) {
        const existing = next[t.id];
        if (!existing) {
          next[t.id] = { status: t.status, notes: t.technicianNotes, savedTick: 0 };
        } else if (existing.savedTick > 0) {
          // After a successful submit, the source of truth is the task itself.
          next[t.id] = { ...existing, status: t.status, notes: t.technicianNotes };
        }
      }
      return next;
    });
  }, [tasks]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="anim-enter">
        <CardBody>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Assigned tasks</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Accept tasks, update status, and add repair notes. Completed tasks move to History.
          </p>
        </CardBody>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          className="anim-enter delay-100"
          title="No active tasks"
          description="Completed tasks are in History. New assignments from admin will appear here."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((t, i) => {
            const draft = drafts[t.id] ?? { status: t.status, notes: t.technicianNotes, savedTick: 0 };
            const hasChanges = draft.status !== t.status || draft.notes !== t.technicianNotes;
            const requestUser = dorm.users.find((u) => u.id === t.userId);

            return (
            <div
              key={t.id}
              className="anim-enter rounded-3xl border border-zinc-200/70 bg-white [box-shadow:var(--shadow-md)]"
              style={{ animationDelay: `${(i + 1) * 60}ms` } as React.CSSProperties}
            >
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold sm:text-lg">{t.title}</div>
                    <div className="mt-1.5 text-sm leading-relaxed text-zinc-600">{t.description}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone={toneForStatus(t.status)}>
                        {t.status.replaceAll("_", " ")}
                      </Badge>
                      <Badge tone={toneForPriority(t.priority ?? "medium")}>
                        {PRIORITY_LABELS[t.priority ?? "medium"]}
                      </Badge>
                      {hasChanges ? <Badge tone="neutral">Unsaved</Badge> : null}
                      <span className="text-xs text-zinc-400">{formatDateTime(t.updatedAt)}</span>
                      {t.preferredAt ? (
                        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200/60" suppressHydrationWarning>
                          Preferred: {formatDateTime(t.preferredAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-left">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">User details</div>
                      <div className="mt-2 space-y-1 text-sm text-zinc-700">
                        <div><span className="font-medium">Name:</span> {requestUser?.name ?? "—"}</div>
                        <div>
                          <span className="font-medium">Room:</span>{" "}
                          {requestUser
                            ? [requestUser.building, requestUser.floor, requestUser.room].filter(Boolean).join("-") || "—"
                            : "—"}
                        </div>
                        <div><span className="font-medium">Phone:</span> {requestUser?.phone ?? "—"}</div>
                        {t.preferredAt ? (
                          <div>
                            <span className="font-medium">Preferred:</span>{" "}
                            <span suppressHydrationWarning>{formatDateTime(t.preferredAt)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {!t.acceptedByTechnician ? (
                      <div className="flex flex-col gap-2 sm:items-end">
                        <Button onClick={() => dorm.technicianAccept({ requestId: t.id })} type="button">Accept</Button>
                        <Button variant="secondary" type="button" onClick={() => dorm.technicianDecline({ requestId: t.id })}>Decline</Button>
                      </div>
                    ) : (
                      <Badge tone="success">Accepted</Badge>
                    )}
                  </div>
                </div>

                {t.status !== "complete" ? (
                  <Link
                    href={`/technician/tasks/${t.id}/chat`}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-700
                      transition-all duration-200 hover:bg-zinc-100 hover:[box-shadow:var(--shadow-sm)]"
                  >
                    <span>Message resident</span>
                    <span className="text-zinc-400">→</span>
                  </Link>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Update status</label>
                    <div className="flex flex-wrap gap-2">
                      {(["pending", "in_progress", "complete"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDrafts((prev) => ({ ...prev, [t.id]: { ...draft, status: s } }))}
                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                            draft.status === s
                              ? "bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.18)]"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          {s.replaceAll("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Repair notes</label>
                    <Textarea
                      value={draft.notes}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [t.id]: { ...draft, notes: e.target.value } }))}
                      placeholder="Add what you repaired…"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={!hasChanges}
                    onClick={() => setDrafts((prev) => ({ ...prev, [t.id]: { ...draft, status: t.status, notes: t.technicianNotes } }))}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    disabled={!t.acceptedByTechnician || !hasChanges}
                    onClick={() => {
                      dorm.technicianUpdate({ requestId: t.id, status: draft.status, technicianNotes: draft.notes });
                      setDrafts((prev) => ({ ...prev, [t.id]: { ...draft, savedTick: Date.now() } }));
                    }}
                  >
                    Submit update
                  </Button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}

