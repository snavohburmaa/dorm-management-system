"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Textarea } from "@/components/Textarea";
import { useDorm } from "@/lib/store";
import type { RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
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
    return dorm.requests.filter((r) => r.assignedTechnicianId === techId);
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
            repair notes.
          </p>
        </CardBody>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState title="No assigned tasks yet" description="Once admin assigns you a request, it will show here." />
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => {
            const draft = drafts[t.id] ?? { status: t.status, notes: t.technicianNotes, savedTick: 0 };
            const hasChanges = draft.status !== t.status || draft.notes !== t.technicianNotes;

            return (
            <Card key={t.id}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{t.title}</div>
                    <div className="mt-2 text-sm text-zinc-700">
                      {t.description}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone={toneForStatus(t.status)}>
                        {t.status.replaceAll("_", " ")}
                      </Badge>
                      {hasChanges ? <Badge tone="neutral">Not saved</Badge> : null}
                      <span className="text-xs text-zinc-500">
                        Updated: {new Date(t.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!t.acceptedByTechnician ? (
                    <Button
                      onClick={() => dorm.technicianAccept({ requestId: t.id })}
                      type="button"
                    >
                      Accept
                    </Button>
                  ) : (
                    <Badge tone="neutral">Accepted</Badge>
                  )}
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

