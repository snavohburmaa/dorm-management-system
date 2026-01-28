"use client";

import { useMemo } from "react";
import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

export default function UserAnnouncementsPage() {
  const { announcements, session, users } = useDorm();

  const user = useMemo(() => {
    if (session?.role !== "user") return null;
    return users.find((u) => u.id === session.id) ?? null;
  }, [session, users]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Announcements</h1>
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold sm:text-lg">{a.title}</div>
                    <div className="mt-2 text-sm text-zinc-600">{a.body}</div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-zinc-500">
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

