"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  // Determine current stage
  let currentStageIndex = -1;
  if (request.status === "complete") {
    currentStageIndex = 3; // Done
  } else if (request.status === "in_progress") {
    currentStageIndex = 2; // Progress
  } else if (request.acceptedByTechnician) {
    currentStageIndex = 2; // Progress (tech accepted, should be in progress soon)
  } else if (request.assignedTechnicianId !== null) {
    currentStageIndex = 1; // Tech (waiting for tech to accept)
  } else {
    currentStageIndex = 0; // Admin (waiting for admin to assign)
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
    <div className="mt-4">
      <div className="flex items-center">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  stage.completed
                    ? "bg-emerald-500 text-white"
                    : stage.current
                      ? "bg-blue-500 text-white ring-2 ring-blue-200"
                      : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`mt-1.5 text-xs font-medium ${
                  stage.completed || stage.current ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                {stage.label}
              </div>
            </div>
            {index < stages.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  stage.completed ? "bg-emerald-500" : "bg-zinc-200"
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
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

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

  const toggleRequest = (requestId: string) => {
    setExpandedRequests((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
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
            const isExpanded = expandedRequests.has(group.requestId);
            const notificationCount = group.notifications.length;

            return (
              <Card key={group.requestId}>
                <CardBody>
                  <button
                    onClick={() => toggleRequest(group.requestId)}
                    className="w-full text-left"
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold">{group.request.title}</div>
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
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="size-5 text-zinc-500" />
                        ) : (
                          <ChevronDown className="size-5 text-zinc-500" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 border-t border-zinc-200 pt-4">
                      <div className="mb-3 text-sm font-semibold text-zinc-700">
                        All notifications for this request ({notificationCount})
                      </div>
                      <div className="space-y-3">
                        {group.notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm font-semibold">{notif.title}</div>
                                <div className="mt-1 text-sm text-zinc-700">
                                  {notif.message}
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-zinc-500">
                                {formatDateTime(notif.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

