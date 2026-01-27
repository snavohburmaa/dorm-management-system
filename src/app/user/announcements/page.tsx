"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useDorm } from "@/lib/store";
import { formatDate, formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

export default function UserAnnouncementsPage() {
  const { announcements, requests, session, users } = useDorm();
  const [expandRequests, setExpandRequests] = useState(false);

  const user = useMemo(() => {
    if (session?.role !== "user") return null;
    return users.find((u) => u.id === session.id) ?? null;
  }, [session, users]);

  const myRequests = useMemo(() => {
    if (session?.role !== "user") return [];
    return requests.filter((r) => r.userId === session.id);
  }, [requests, session]);

  const PREVIEW_COUNT = 3;
  const showViewMore = myRequests.length > PREVIEW_COUNT;
  const displayRequests = expandRequests ? myRequests : myRequests.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold tracking-tight">User Info</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="font-semibold text-zinc-600">Name:</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-600">Phone:</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{user?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-600">Room No:</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{user?.room ?? "—"}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold tracking-tight">Maintenance Request List</h2>
          {myRequests.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No maintenance requests yet.</p>
          ) : (
            <>
              <ol className="mt-3 list-decimal list-inside space-y-3">
                {displayRequests.map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{r.title}</span>
                    <Badge tone={toneForStatus(r.status)} className="ml-2">
                      {r.status.replaceAll("_", " ")}
                    </Badge>
                    <span className="ml-2 text-zinc-500">
                      {formatDate(r.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
              {showViewMore && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => setExpandRequests((v) => !v)}
                  >
                    {expandRequests ? "Show less" : "View More"}
                  </Button>
                  <Link
                    href="/user/requests"
                    className="text-sm font-semibold text-zinc-600 underline underline-offset-2 hover:text-zinc-950"
                  >
                    Go to Maintenance Request List
                  </Link>
                </div>
              )}
              {!showViewMore && myRequests.length > 0 && (
                <div className="mt-4">
                  <Link
                    href="/user/requests"
                    className="text-sm font-semibold text-zinc-600 underline underline-offset-2 hover:text-zinc-950"
                  >
                    Go to Maintenance Request List
                  </Link>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You will see announcements posted by the admin here.
          </p>
        </CardBody>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{a.title}</div>
                    <div className="mt-2 text-sm text-zinc-600">{a.body}</div>
                  </div>
                  <div className="text-xs font-semibold text-zinc-500">
                    {formatDateTime(a.createdAt)}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

