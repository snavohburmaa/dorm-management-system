"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestPriority } from "@/lib/types";
import { X } from "lucide-react";

const PRIORITY_LABELS: Record<RequestPriority, string> = {
  urgent: "Urgent",
  medium: "Medium",
  low: "Low",
  enhancement: "Enhancement",
};

export default function AdminHistoryPage() {
  const dorm = useDorm();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const completedRequests = useMemo(() => {
    return dorm.requests
      .filter((r) => r.status === "complete")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [dorm.requests]);

  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return completedRequests.find((r) => r.id === selectedRequestId) ?? null;
  }, [completedRequests, selectedRequestId]);

  const selectedUser = useMemo(() => {
    if (!selectedRequest) return null;
    return dorm.users.find((u) => u.id === selectedRequest.userId) ?? null;
  }, [dorm.users, selectedRequest]);

  const selectedTechnician = useMemo(() => {
    if (!selectedRequest?.assignedTechnicianId) return null;
    return (
      dorm.technicians.find((t) => t.id === selectedRequest.assignedTechnicianId) ??
      null
    );
  }, [dorm.technicians, selectedRequest]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="anim-enter">
        <CardBody>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Request History</h1>
          <p className="mt-1.5 text-sm text-zinc-500">All completed maintenance requests.</p>
        </CardBody>
      </Card>

      {completedRequests.length === 0 ? (
        <EmptyState
          className="anim-enter delay-100"
          title="No completed requests yet"
          description="Completed requests will appear here."
        />
      ) : (
        <Card className="anim-enter delay-50">
          <CardBody className="space-y-2">
            <div className="mb-1 text-xs font-semibold text-zinc-500">
              {completedRequests.length} completed
            </div>
            {completedRequests.map((r, i) => {
              const requestUser = dorm.users.find((u) => u.id === r.userId);
              const tech = r.assignedTechnicianId
                ? dorm.technicians.find((t) => t.id === r.assignedTechnicianId)
                : null;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRequestId(r.id)}
                  className="anim-enter w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 text-left
                    transition-all duration-200 hover:border-zinc-200 hover:bg-white hover:[box-shadow:var(--shadow-md)]"
                  style={{ animationDelay: `${(i + 1) * 40}ms` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-zinc-400">
                        Completed: {formatDateTime(r.updatedAt)}
                        {" · "}
                        {requestUser
                          ? [requestUser.building, requestUser.floor, requestUser.room].filter(Boolean).join("-") || "—"
                          : "—"}
                        {tech ? ` · ${tech.name}` : ""}
                      </div>
                      <div className="mt-2">
                        <Badge tone="success">complete</Badge>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-400">View →</span>
                  </div>
                </button>
              );
            })}
          </CardBody>
        </Card>
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-detail-title"
          onClick={() => setSelectedRequestId(null)}
        >
          <div
            className="anim-pop w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl [box-shadow:var(--shadow-xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="history-detail-title" className="text-lg font-bold">
                    Completed Request
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId(null)}
                    className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Name</div>
                    <div className="mt-1 text-sm font-medium">{selectedUser?.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Room</div>
                    <div className="mt-1 text-sm font-medium">
                      {selectedUser
                        ? [selectedUser.building, selectedUser.floor, selectedUser.room].filter(Boolean).join("-") || "—"
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Phone</div>
                    <div className="mt-1 text-sm font-medium">{selectedUser?.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Technician</div>
                    <div className="mt-1 text-sm font-medium">{selectedTechnician?.name || "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Issue</div>
                  <div className="mt-2 rounded-2xl border border-zinc-100 bg-white p-3 [box-shadow:var(--shadow-xs)]">
                    <div className="text-sm font-semibold">{selectedRequest.title}</div>
                    <div className="mt-1.5 text-sm text-zinc-600">{selectedRequest.description}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">complete</Badge>
                  <Badge tone="neutral">{PRIORITY_LABELS[selectedRequest.priority] ?? "Medium"}</Badge>
                  <span className="text-xs text-zinc-400">
                    Completed: {formatDateTime(selectedRequest.updatedAt)}
                  </span>
                </div>

                {selectedRequest.technicianNotes?.trim() ? (
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Technician notes</div>
                    <div className="mt-2 text-sm text-zinc-700">{selectedRequest.technicianNotes}</div>
                  </div>
                ) : null}

                <Button type="button" className="w-full" onClick={() => setSelectedRequestId(null)}>
                  Close
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
