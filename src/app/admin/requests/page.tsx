"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestPriority, RequestStatus } from "@/lib/types";
import { X } from "lucide-react";

const PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "enhancement", label: "Enhancement" },
];

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

export default function AdminRequestsPage() {
  const dorm = useDorm();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const activeRequests = useMemo(
    () => dorm.requests.filter((r) => r.status !== "complete"),
    [dorm.requests]
  );

  const filteredRequests = useMemo(() => {
    const sorted = [...activeRequests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [activeRequests, filter]);

  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return dorm.requests.find((r) => r.id === selectedRequestId) ?? null;
  }, [dorm.requests, selectedRequestId]);

  const selectedUser = useMemo(() => {
    if (!selectedRequest) return null;
    return dorm.users.find((u) => u.id === selectedRequest.userId) ?? null;
  }, [dorm.users, selectedRequest]);

  const counts = useMemo(() => {
    return {
      all: activeRequests.length,
      pending: activeRequests.filter((r) => r.status === "pending").length,
      in_progress: activeRequests.filter((r) => r.status === "in_progress").length,
      complete: dorm.requests.filter((r) => r.status === "complete").length,
    };
  }, [activeRequests, dorm.requests]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">
            Maintenance Requests
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            View and manage all maintenance requests. Assign technicians and set priority.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              type="button"
              onClick={() => setFilter("in_progress")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "in_progress"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              In Progress ({counts.in_progress})
            </button>
          </div>
          {counts.complete > 0 ? (
            <p className="text-xs text-zinc-500">
              Completed requests ({counts.complete}) are in History.
            </p>
          ) : null}

          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No active requests"
              description={
                filter === "all"
                  ? "No pending or in-progress requests. Completed requests are in History."
                  : `No ${filter.replace("_", " ")} requests.`
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((r) => {
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
                        <div className="mt-1 text-xs text-zinc-500" suppressHydrationWarning>
                          {formatDateTime(r.createdAt)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Room:{" "}
                          {requestUser
                            ? [requestUser.building, requestUser.floor, requestUser.room]
                                .filter(Boolean)
                                .join("-") || "—"
                            : "—"}
                          <span className="mx-2">•</span>
                          {requestUser?.name || "Unknown"}
                          {tech && (
                            <>
                              <span className="mx-2">•</span>
                              Tech: {tech.name}
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge tone={toneForStatus(r.status)}>
                            {r.status.replaceAll("_", " ")}
                          </Badge>
                          <Badge tone="neutral">
                            {PRIORITIES.find((p) => p.value === r.priority)?.label ?? "Medium"}
                          </Badge>
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
          )}
        </CardBody>
      </Card>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-detail-title"
          onClick={() => setSelectedRequestId(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="request-detail-title" className="text-lg font-semibold">
                    Request Details
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
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold text-zinc-500">Phone</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedUser?.phone || "—"}
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
                  <Badge tone={toneForStatus(selectedRequest.status)}>
                    {selectedRequest.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="text-xs text-zinc-500" suppressHydrationWarning>
                    {formatDateTime(selectedRequest.createdAt)}
                  </span>
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

                <div>
                  <div className="mb-2 text-xs font-semibold text-zinc-600">
                    Priority
                  </div>
                  <select
                    className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium"
                    value={selectedRequest.priority ?? "medium"}
                    onChange={(e) =>
                      dorm.setRequestPriority({
                        requestId: selectedRequest.id,
                        priority: e.target.value as RequestPriority,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-zinc-600">
                    Assign technician
                  </div>
                  {selectedRequest.acceptedByTechnician ? (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                      Assigned to{" "}
                      {dorm.technicians.find(
                        (t) => t.id === selectedRequest.assignedTechnicianId
                      )?.name ?? "—"}{" "}
                      (accepted). Cannot reassign.
                    </div>
                  ) : (
                    <select
                      className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium"
                      value={selectedRequest.assignedTechnicianId ?? ""}
                      onChange={(e) =>
                        dorm.assignTechnician({
                          requestId: selectedRequest.id,
                          technicianId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {dorm.technicians.map((t) => {
                        const declined = (
                          selectedRequest.declinedByTechnicianIds ?? []
                        ).includes(t.id);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name}
                            {declined ? " (Declined)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setSelectedRequestId(null)}
                >
                  Submit
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
