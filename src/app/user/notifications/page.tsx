"use client";

import { useMemo } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { Check } from "lucide-react";

function toneForStatus(status: RequestStatus | string) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  if (status === "complete") return "success";
  return "neutral";
}

type GroupedNotifications = {
  requestId: string;
  request: {
    id: string;
    title: string;
    status: RequestStatus;
    description: string;
    assignedTechnicianId: string | null;
    acceptedByTechnician: boolean;
    technicianNotes: string;
  };
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    type: string;
  }>;
  latestNotification: {
    title: string;
    message: string;
    createdAt: string;
  };
  technician: { name: string; phone: string } | null;
};

type ProcessStage = {
  label: string;
  completed: boolean;
  current: boolean;
};

function ProcessTimeline({ request }: { request: GroupedNotifications["request"] }) {
  let currentStageIndex = -1;
  if (request.status === "complete") {
    currentStageIndex = 3;
  } else if (request.status === "in_progress") {
    currentStageIndex = 2;
  } else if (request.acceptedByTechnician) {
    currentStageIndex = 2;
  } else if (request.assignedTechnicianId !== null) {
    currentStageIndex = 1;
  } else {
    currentStageIndex = 0;
  }

  const stages: ProcessStage[] = [
    {
      label: "Admin",
      completed: request.assignedTechnicianId !== null,
      current: currentStageIndex === 0,
    },
    {
      label: "Tech",
      completed: request.acceptedByTechnician,
      current: currentStageIndex === 1,
    },
    {
      label: "Progress",
      completed: request.status === "in_progress" || request.status === "complete",
      current: currentStageIndex === 2,
    },
    {
      label: "Done",
      completed: request.status === "complete",
      current: currentStageIndex === 3,
    },
  ];

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-50/50 px-4 py-4 sm:px-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Request status
      </div>
      <div className="flex min-w-max items-start sm:min-w-0">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex flex-1 items-start">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-all sm:size-10 sm:text-sm ${
                  stage.completed
                    ? "bg-emerald-500 text-white"
                    : stage.current
                      ? "bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 ring-offset-zinc-50"
                      : "bg-white text-zinc-400 ring-1 ring-zinc-200"
                }`}
              >
                {stage.completed ? (
                  <Check className="size-3.5 sm:size-5" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </div>
              <div
                className={`mt-1.5 text-center text-[10px] font-medium sm:mt-2 sm:text-xs ${
                  stage.completed || stage.current
                    ? "text-zinc-900"
                    : "text-zinc-400"
                }`}
              >
                {stage.label}
              </div>
            </div>
            {index < stages.length - 1 && (
              <div
                className={`relative top-4 mx-0.5 h-1 flex-1 self-start rounded-full sm:top-5 sm:mx-1 ${
                  stage.completed ? "bg-emerald-400" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserNotificationsPage() {
  const { session, notifications, requests, technicians } = useDorm();
  const userId = session?.role === "user" ? session.id : null;

  const grouped = useMemo<GroupedNotifications[]>(() => {
    if (!userId) return [];

    const userNotifications = notifications.filter((n) => n.userId === userId);
    
    // Group by requestId
    const groups = new Map<string, GroupedNotifications>();

    for (const notif of userNotifications) {
      const req = requests.find((r) => r.id === notif.requestId);
      if (!req) continue;

      if (!groups.has(notif.requestId)) {
        const tech = req.assignedTechnicianId
          ? technicians.find((t) => t.id === req.assignedTechnicianId) ?? null
          : null;

        groups.set(notif.requestId, {
          requestId: notif.requestId,
          request: {
            id: req.id,
            title: req.title,
            status: req.status,
            description: req.description,
            assignedTechnicianId: req.assignedTechnicianId,
            acceptedByTechnician: req.acceptedByTechnician,
            technicianNotes: req.technicianNotes ?? "",
          },
          notifications: [],
          latestNotification: {
            title: notif.title,
            message: notif.message,
            createdAt: notif.createdAt,
          },
          technician: tech ? { name: tech.name, phone: tech.phone || "" } : null,
        });
      }

      const group = groups.get(notif.requestId)!;
      group.notifications.push({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        createdAt: notif.createdAt,
        type: notif.type,
      });

      // Update latest if this notification is newer
      if (new Date(notif.createdAt) > new Date(group.latestNotification.createdAt)) {
        group.latestNotification = {
          title: notif.title,
          message: notif.message,
          createdAt: notif.createdAt,
        };
      }
    }

    // Sort notifications within each group (newest first)
    for (const group of groups.values()) {
      group.notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Sort groups by latest notification time (newest first)
    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(b.latestNotification.createdAt).getTime() -
        new Date(a.latestNotification.createdAt).getTime()
    );
  }, [userId, notifications, requests, technicians]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Notifications</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Technician updates (pending / in progress / complete) will appear
            here.
          </p>
        </CardBody>
      </Card>

      {grouped.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => {
            const notificationCount = group.notifications.length;

            return (
              <Card key={group.requestId}>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold sm:text-lg">{group.request.title}</div>
                        <Badge tone={toneForStatus(group.request.status)}>
                          {group.request.status.replaceAll("_", " ")}
                        </Badge>
                        {notificationCount > 1 && (
                          <Badge tone="neutral" className="text-xs">
                            {notificationCount} updates
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-zinc-700">
                        {group.latestNotification.message}
                      </div>
                      {group.technician && (
                        <div className="mt-2 text-xs text-zinc-500">
                          Technician: {group.technician.name}
                          {group.technician.phone ? ` (${group.technician.phone})` : ""}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-zinc-500">
                        Latest: {formatDateTime(group.latestNotification.createdAt)}
                      </div>
                      <div className="mt-3 rounded-xl border-2 border-zinc-200 bg-zinc-50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Tech&apos;s note
                        </div>
                        <div className="mt-2 min-h-[2.5rem] text-sm text-zinc-800">
                          {group.request.technicianNotes.trim()
                            ? group.request.technicianNotes
                            : "—"}
                        </div>
                      </div>
                      <ProcessTimeline request={group.request} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

