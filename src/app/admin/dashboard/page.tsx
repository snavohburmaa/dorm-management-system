"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/Badge";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

export default function AdminDashboardPage() {
  const dorm = useDorm();
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const report = useMemo(() => {
    const byStatus = dorm.requests.reduce<Record<RequestStatus, number>>(
      (acc, r) => {
        acc[r.status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, complete: 0 },
    );

    const byYear = dorm.requests.reduce<Record<string, number>>((acc, r) => {
      const y = new Date(r.createdAt).getFullYear().toString();
      acc[y] = (acc[y] ?? 0) + 1;
      return acc;
    }, {});

    return { byStatus, byYear };
  }, [dorm.requests]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Manage users, maintenance requests, technician assignments, reports,
            and announcements.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Users</div>
            <div className="text-sm text-zinc-600">
              {dorm.users.length} users, {dorm.technicians.length} technicians
            </div>
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
              {dorm.users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {u.building}-{u.floor}-{u.room}
                  </div>
                </div>
              ))}
              {dorm.users.length === 0 ? (
                <div className="px-4 py-3 text-sm text-zinc-600">No users yet.</div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Maintenance requests</div>
            <div className="text-sm text-zinc-600">
              Assign technicians to requests.
            </div>
            <div className="space-y-3">
              {dorm.requests.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {formatDateTime(r.createdAt)}
                      </div>
                      <div className="mt-2">
                        <Badge tone={toneForStatus(r.status)}>
                          {r.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <select
                      className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-semibold"
                      value={r.assignedTechnicianId ?? ""}
                      onChange={(e) =>
                        dorm.assignTechnician({
                          requestId: r.id,
                          technicianId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {dorm.technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {dorm.requests.length === 0 ? (
                <div className="text-sm text-zinc-600">No requests yet.</div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Reports</div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning">Pending: {report.byStatus.pending}</Badge>
              <Badge tone="info">In progress: {report.byStatus.in_progress}</Badge>
              <Badge tone="success">Complete: {report.byStatus.complete}</Badge>
            </div>
            <div className="mt-2 rounded-2xl border border-zinc-200 p-4">
              <div className="text-xs font-semibold text-zinc-600">Yearly</div>
              <div className="mt-2 space-y-1 text-sm">
                {Object.keys(report.byYear).length === 0 ? (
                  <div className="text-sm text-zinc-600">No data yet.</div>
                ) : (
                  Object.entries(report.byYear).map(([year, count]) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-zinc-700">{year}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="text-sm font-semibold">Announcements</div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Title</div>
              <Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Body</div>
              <Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder="Write announcement..." />
            </div>
            <Button
              onClick={() => {
                dorm.addAnnouncement({ title: annTitle, body: annBody });
                setAnnTitle("");
                setAnnBody("");
              }}
              type="button"
            >
              Post announcement
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

