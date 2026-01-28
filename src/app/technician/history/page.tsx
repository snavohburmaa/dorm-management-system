"use client";

import { useMemo } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

export default function TechnicianHistoryPage() {
  const dorm = useDorm();
  const techId = dorm.session?.role === "technician" ? dorm.session.id : null;

  const completedTasks = useMemo(() => {
    if (!techId) return [];
    return dorm.requests
      .filter(
        (r) => r.assignedTechnicianId === techId && r.status === "complete"
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [dorm.requests, techId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">History</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Tasks you marked complete. Your repair notes were sent to admin.
          </p>
        </CardBody>
      </Card>

      {completedTasks.length === 0 ? (
        <EmptyState
          title="No completed tasks yet"
          description="Finished tasks will appear here."
        />
      ) : (
        <div className="space-y-4">
          {completedTasks.map((t) => {
            const requestUser = dorm.users.find((u) => u.id === t.userId);
            return (
              <Card key={t.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold sm:text-lg">{t.title}</div>
                      <div className="mt-2 text-sm text-zinc-700">
                        {t.description}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone="success">complete</Badge>
                        <span className="text-xs text-zinc-500">
                          Completed: {formatDateTime(t.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left sm:w-auto">
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
                  </div>

                  {t.technicianNotes?.trim() ? (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs font-semibold text-zinc-500">
                        Notes sent to admin
                      </div>
                      <div className="mt-2 text-sm text-zinc-800">
                        {t.technicianNotes}
                      </div>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
