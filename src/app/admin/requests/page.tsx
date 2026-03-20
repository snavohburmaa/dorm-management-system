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
    <div className="space-y-4 sm:space-y-5">
      <Card className="anim-enter">
        <CardBody>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Maintenance Requests
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            View and manage all maintenance requests. Assign technicians and set priority.
          </p>
        </CardBody>
      </Card>

      <Card className="anim-enter delay-50">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { key: "all",         label: `All (${counts.all})` },
              { key: "pending",     label: `Pending (${counts.pending})` },
              { key: "in_progress", label: `In Progress (${counts.in_progress})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as typeof filter)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-150 sm:px-4 ${
                  filter === key
                    ? "bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.18)]"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {counts.complete > 0 ? (
            <p className="text-xs text-zinc-400">
              {counts.complete} completed — visible in History.
            </p>
          ) : null}

          {filteredRequests.length === 0 ? (
            <EmptyState
              title="No active requests"
              description={
                filter === "all"
                  ? "No pending or in-progress requests."
                  : `No ${filter.replace("_", " ")} requests.`
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((r, i) => {
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
                        <div className="mt-1 text-xs text-zinc-400" suppressHydrationWarning>
                          {formatDateTime(r.createdAt)}
                          {" · "}
                          {requestUser
                            ? [requestUser.building, requestUser.floor, requestUser.room].filter(Boolean).join("-") || "—"
                            : "—"}
                          {" · "}
                          {requestUser?.name || "Unknown"}
                          {tech ? ` · Tech: ${tech.name}` : ""}
                        </div>
                        {r.preferredAt ? (
                          <div className="mt-1 text-xs text-sky-600" suppressHydrationWarning>
                            Preferred: {formatDateTime(r.preferredAt)}
                          </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge tone={toneForStatus(r.status)}>
                            {r.status.replaceAll("_", " ")}
                          </Badge>
                          <Badge tone="neutral">
                            {PRIORITIES.find((p) => p.value === r.priority)?.label ?? "Medium"}
                          </Badge>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-zinc-400">View →</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-detail-title"
          onClick={() => setSelectedRequestId(null)}
        >
          <div
            className="anim-pop w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl [box-shadow:var(--shadow-xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="request-detail-title" className="text-lg font-bold">
                    Request Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedRequestId(null)}
                    className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
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
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Phone</div>
                    <div className="mt-1 text-sm font-medium">{selectedUser?.phone || "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Issue</div>
                  <div className="mt-2 rounded-2xl border border-zinc-100 bg-white p-3 [box-shadow:var(--shadow-xs)]">
                    <div className="text-sm font-semibold">{selectedRequest.title}</div>
                    <div className="mt-1.5 text-sm text-zinc-600">{selectedRequest.description}</div>
                  </div>
                </div>

                {selectedRequest.preferredAt ? (
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-sky-500">Preferred time</div>
                    <div className="mt-1 text-sm font-medium text-sky-800" suppressHydrationWarning>
                      {formatDateTime(selectedRequest.preferredAt)}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={toneForStatus(selectedRequest.status)}>
                    {selectedRequest.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="text-xs text-zinc-400" suppressHydrationWarning>
                    {formatDateTime(selectedRequest.createdAt)}
                  </span>
                </div>

                {selectedRequest.technicianNotes?.trim() ? (
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Technician notes</div>
                    <div className="mt-2 text-sm text-zinc-700">{selectedRequest.technicianNotes}</div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Priority</label>
                  <select
                    className="h-10 w-full rounded-2xl border border-zinc-200/80 bg-white px-4 text-sm font-medium outline-none
                      [box-shadow:var(--shadow-xs)] focus:border-zinc-400"
                    value={selectedRequest.priority ?? "medium"}
                    onChange={(e) =>
                      dorm.setRequestPriority({ requestId: selectedRequest.id, priority: e.target.value as RequestPriority })
                    }
                  >
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Assign technician</label>
                  {selectedRequest.acceptedByTechnician ? (
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                      Assigned to{" "}
                      <span className="font-semibold text-zinc-800">
                        {dorm.technicians.find((t) => t.id === selectedRequest.assignedTechnicianId)?.name ?? "—"}
                      </span>{" "}
                      (accepted). Cannot reassign.
                    </div>
                  ) : (
                    <select
                      className="h-10 w-full rounded-2xl border border-zinc-200/80 bg-white px-4 text-sm font-medium outline-none
                        [box-shadow:var(--shadow-xs)] focus:border-zinc-400"
                      value={selectedRequest.assignedTechnicianId ?? ""}
                      onChange={(e) =>
                        dorm.assignTechnician({ requestId: selectedRequest.id, technicianId: e.target.value || null })
                      }
                    >
                      <option value="">Unassigned</option>
                      {dorm.technicians.map((t) => {
                        const declined = (selectedRequest.declinedByTechnicianIds ?? []).includes(t.id);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name}{declined ? " (Declined)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <Button type="button" className="w-full" onClick={() => setSelectedRequestId(null)}>
                  Done
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
