"use client";

import { Card, CardBody } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDorm } from "@/lib/store";

export default function UserAnnouncementsPage() {
  const { announcements } = useDorm();

  return (
    <div className="space-y-6">
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
                    {new Date(a.createdAt).toLocaleString()}
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

