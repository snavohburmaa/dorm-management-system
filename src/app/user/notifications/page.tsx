"use client";

import { Badge } from "@/components/Badge";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";

function toneForStatus(status: string) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  if (status === "complete") return "success";
  return "neutral";
}

export default function UserNotificationsPage() {
  const { session, notifications, requests, technicians } = useDorm();
  const userId = session?.role === "user" ? session.id : null;
  const items = userId ? notifications.filter((n) => n.userId === userId) : [];

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

      {items.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="space-y-4">
          {items.map((n) => {
            const req = requests.find((r) => r.id === n.requestId);
            const tech = req?.assignedTechnicianId
              ? technicians.find((t) => t.id === req.assignedTechnicianId)
              : null;
            return (
              <Card key={n.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{n.title}</div>
                      <div className="mt-2 text-sm text-zinc-700">
                        {n.message}
                      </div>
                      {req ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge tone={toneForStatus(req.status)}>
                            {req.status.replaceAll("_", " ")}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            Issue: {req.title}
                          </span>
                          {tech ? (
                            <span className="text-xs text-zinc-500">
                              Technician: {tech.name}{" "}
                              {tech.phone ? `(${tech.phone})` : ""}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs font-semibold text-zinc-500">
                      {new Date(n.createdAt).toLocaleString()}
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

