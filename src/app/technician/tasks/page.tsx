"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
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
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">Assigned tasks</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Accept tasks, update status (pending → in progress → complete), and add
            repair notes. Notes are sent to admin when you submit. Completed tasks
            move to History.
          </p>
        </CardBody>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          title="No active tasks"
          description="Completed tasks are in History. New assignments from admin will appear here."
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => {
            const draft = drafts[t.id] ?? { status: t.status, notes: t.technicianNotes, savedTick: 0 };
            const hasChanges = draft.status !== t.status || draft.notes !== t.technicianNotes;
            const requestUser = dorm.users.find((u) => u.id === t.userId);

            return (
            <Card key={t.id}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold">{t.title}</div>
                    <div className="mt-2 text-sm text-zinc-700">
                      {t.description}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone={toneForStatus(t.status)}>
                        {t.status.replaceAll("_", " ")}
                      </Badge>
                      <Badge tone={toneForPriority(t.priority ?? "medium")}>
                        {PRIORITY_LABELS[t.priority ?? "medium"]}
                      </Badge>
                      {hasChanges ? <Badge tone="neutral">Not saved</Badge> : null}
                      <span className="text-xs text-zinc-500">
                        Updated: {formatDateTime(t.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left">
                      <div className="text-xs font-semibold text-zinc-500">
                        User details
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-zinc-700">Name:</span>{" "}
                          {requestUser?.name ?? "—"}
                        </div>
                        <div>
                          <span className="font-medium text-zinc-700">Room No:</span>{" "}
                          {requestUser
                            ? [requestUser.building, requestUser.floor, requestUser.room]
                                .filter(Boolean)
                                .join("-") || "—"
                            : "—"}
                        </div>
                        <div>
                          <span className="font-medium text-zinc-700">Phone:</span>{" "}
                          {requestUser?.phone ?? "—"}
                        </div>
                      </div>
                    </div>
                    {!t.acceptedByTechnician ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => dorm.technicianAccept({ requestId: t.id })}
                          type="button"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => dorm.technicianDecline({ requestId: t.id })}
                        >
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Badge tone="neutral">Accepted</Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-600">
                      Status
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["pending", "in_progress", "complete"] as const).map(
                        (s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setDrafts((prev) => ({
                                ...prev,
                                [t.id]: { ...draft, status: s },
                              }))
                            }
                            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                              draft.status === s
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                            }`}
                          >
                            {s.replaceAll("_", " ")}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-600">
                      Repair notes
                    </div>
                    <Textarea
                      value={draft.notes}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [t.id]: { ...draft, notes: e.target.value },
                        }))
                      }
                      placeholder="Add what you repaired..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={!hasChanges}
                    onClick={() =>
                      setDrafts((prev) => ({
                        ...prev,
                        [t.id]: { ...draft, status: t.status, notes: t.technicianNotes },
                      }))
                    }
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    disabled={!t.acceptedByTechnician || !hasChanges}
                    onClick={() => {
                      dorm.technicianUpdate({
                        requestId: t.id,
                        status: draft.status,
                        technicianNotes: draft.notes,
                      });
                      setDrafts((prev) => ({
                        ...prev,
                        [t.id]: { ...draft, savedTick: Date.now() },
                      }));
                    }}
                  >
                    Submit update
                  </Button>
                </div>
              </CardBody>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}

