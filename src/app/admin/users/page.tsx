"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { X } from "lucide-react";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

export default function AdminUsersPage() {
  const dorm = useDorm();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  // User detail data
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return dorm.users.find((u) => u.id === selectedUserId) ?? null;
  }, [dorm.users, selectedUserId]);

  const userRequests = useMemo(() => {
    if (!selectedUserId) return [];
    return dorm.requests
      .filter((r) => r.userId === selectedUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [dorm.requests, selectedUserId]);

  // Technician detail data
  const selectedTech = useMemo(() => {
    if (!selectedTechId) return null;
    return dorm.technicians.find((t) => t.id === selectedTechId) ?? null;
  }, [dorm.technicians, selectedTechId]);

  const techTasks = useMemo(() => {
    if (!selectedTechId) return [];
    return dorm.requests
      .filter((r) => r.assignedTechnicianId === selectedTechId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [dorm.requests, selectedTechId]);


  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">
            Users & Technicians
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Click a user or technician to view their details and history.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users Column */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold">
              Users ({dorm.users.length})
            </h2>
            {dorm.users.length === 0 ? (
              <EmptyState
                title="No users yet"
                description="Registered residents will appear here."
              />
            ) : (
              <div className="space-y-3">
                {dorm.users.map((u) => {
                  const reqCount = dorm.requests.filter((r) => r.userId === u.id).length;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className="w-full rounded-2xl border border-zinc-200 p-4 space-y-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold">{u.name}</div>
                        <span className="text-xs text-zinc-500">View →</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-zinc-500">Email:</span> {u.email}
                        </div>
                        <div>
                          <span className="text-zinc-500">Room:</span>{" "}
                          {[u.building, u.floor, u.room].filter(Boolean).join("-") || "—"}
                        </div>
                        <div>
                          <span className="text-zinc-500">Requests:</span> {reqCount}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Technicians Column */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-sm font-semibold">
              Technicians ({dorm.technicians.length})
            </h2>
            {dorm.technicians.length === 0 ? (
              <EmptyState
                title="No technicians yet"
                description="Registered technicians will appear here."
              />
            ) : (
              <div className="space-y-3">
                {dorm.technicians.map((t) => {
                  const completedCount = dorm.requests.filter(
                    (r) => r.assignedTechnicianId === t.id && r.status === "complete"
                  ).length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTechId(t.id)}
                      className="w-full rounded-2xl border border-zinc-200 p-4 space-y-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold">{t.name}</div>
                        <span className="text-xs text-zinc-500">View →</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-zinc-500">Email:</span> {t.email}
                        </div>
                        <div>
                          <span className="text-zinc-500">Phone:</span>{" "}
                          {t.phone || "—"}
                        </div>
                        <div>
                          <span className="text-zinc-500">Tasks completed:</span>{" "}
                          {completedCount}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedUserId(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold">User Details</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(null)}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                  <div className="text-base font-semibold">{selectedUser.name}</div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-zinc-500">Email:</span> {selectedUser.email}
                    </div>
                    <div>
                      <span className="text-zinc-500">Phone:</span>{" "}
                      {selectedUser.phone || "—"}
                    </div>
                    <div>
                      <span className="text-zinc-500">Room:</span>{" "}
                      {[selectedUser.building, selectedUser.floor, selectedUser.room]
                        .filter(Boolean)
                        .join("-") || "—"}
                    </div>
                    <div>
                      <span className="text-zinc-500">Registered:</span>{" "}
                      <span suppressHydrationWarning>
                        {formatDateTime(selectedUser.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">
                    Maintenance Requests ({userRequests.length})
                  </div>
                  {userRequests.length === 0 ? (
                    <div className="text-sm text-zinc-500">No requests submitted.</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userRequests.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-xl border border-zinc-200 p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">{r.title}</div>
                            <Badge tone={toneForStatus(r.status)}>
                              {r.status.replaceAll("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-xs text-zinc-500" suppressHydrationWarning>
                            {formatDateTime(r.createdAt)}
                          </div>
                          <div className="text-xs text-zinc-600 line-clamp-2">
                            {r.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSelectedUserId(null)}
                >
                  Close
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Technician Detail Modal */}
      {selectedTech && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedTechId(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold">Technician Details</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTechId(null)}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                  <div className="text-base font-semibold">{selectedTech.name}</div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-zinc-500">Email:</span> {selectedTech.email}
                    </div>
                    <div>
                      <span className="text-zinc-500">Phone:</span>{" "}
                      {selectedTech.phone || "—"}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500">Registered:</span>{" "}
                      <span suppressHydrationWarning>
                        {formatDateTime(selectedTech.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">
                    Task History ({techTasks.length})
                  </div>
                  {techTasks.length === 0 ? (
                    <div className="text-sm text-zinc-500">No tasks assigned yet.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {techTasks.map((r) => {
                        const reqUser = dorm.users.find((u) => u.id === r.userId);
                        return (
                          <div
                            key={r.id}
                            className="rounded-xl border border-zinc-200 p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold">{r.title}</div>
                              <Badge tone={toneForStatus(r.status)}>
                                {r.status.replaceAll("_", " ")}
                              </Badge>
                            </div>
                            <div className="text-xs text-zinc-500">
                              Room:{" "}
                              {reqUser
                                ? [reqUser.building, reqUser.floor, reqUser.room]
                                    .filter(Boolean)
                                    .join("-") || "—"
                                : "—"}
                            </div>
                            <div
                              className="text-xs text-zinc-500"
                              suppressHydrationWarning
                            >
                              Updated: {formatDateTime(r.updatedAt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSelectedTechId(null)}
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
