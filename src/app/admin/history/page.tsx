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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Request History
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            View all completed maintenance requests.
          </p>
        </CardBody>
      </Card>

      {completedRequests.length === 0 ? (
        <EmptyState
          title="No completed requests yet"
          description="Completed maintenance requests will appear here."
        />
      ) : (
        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">
              Completed requests ({completedRequests.length})
            </div>
            <div className="space-y-3">
              {completedRequests.map((r) => {
                const requestUser = dorm.users.find((u) => u.id === r.userId);
                const tech = r.assignedTechnicianId
                  ? dorm.technicians.find((t) => t.id === r.assignedTechnicianId)
                  : null;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRequestId(r.id)}
                    className="w-full rounded-2xl border border-zinc-200 p-4 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{r.title}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Completed: {formatDateTime(r.updatedAt)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Room: {requestUser
                            ? [requestUser.building, requestUser.floor, requestUser.room]
                                .filter(Boolean)
                                .join("-") || "—"
                            : "—"}
                          {tech && <span className="ml-3">Tech: {tech.name}</span>}
                        </div>
                        <div className="mt-2">
                          <Badge tone="success">complete</Badge>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-zinc-500">
                        View details →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-detail-title"
          onClick={() => setSelectedRequestId(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="history-detail-title" className="text-lg font-semibold">
                    Completed Request Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId(null)}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">Name</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedUser?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">Room No</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedUser
                        ? [selectedUser.building, selectedUser.floor, selectedUser.room]
                            .filter(Boolean)
                            .join("-") || "—"
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">Phone</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedUser?.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">
                      Assigned Technician
                    </div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedTechnician?.name || "—"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-zinc-500">Issue</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-white p-3">
                    <div className="text-sm font-semibold">{selectedRequest.title}</div>
                    <div className="mt-2 text-sm text-zinc-700">
                      {selectedRequest.description}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">complete</Badge>
                  <Badge tone="neutral">
                    {PRIORITY_LABELS[selectedRequest.priority] ?? "Medium"}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    Created: {formatDateTime(selectedRequest.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-zinc-500">
                  Completed: {formatDateTime(selectedRequest.updatedAt)}
                </div>

                {selectedRequest.technicianNotes?.trim() ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-xs font-semibold text-zinc-500">
                      Technician notes
                    </div>
                    <div className="mt-2 text-sm text-zinc-800">
                      {selectedRequest.technicianNotes}
                    </div>
                  </div>
                ) : null}

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setSelectedRequestId(null)}
                >
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
