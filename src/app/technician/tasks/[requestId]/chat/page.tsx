"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardBody } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

export default function TechnicianTaskChatPage() {
  const params = useParams();
  const requestId = typeof params.requestId === "string" ? params.requestId : "";
  const dorm = useDorm();
  const techId = dorm.session?.role === "technician" ? dorm.session.id : null;
  const request = dorm.requests.find(
    (r) => r.id === requestId && r.assignedTechnicianId === techId
  );
  const requestUser = request ? dorm.users.find((u) => u.id === request.userId) : null;

  if (dorm.session?.role !== "technician") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">You must be logged in as a technician.</p>
        <Link href="/technician/tasks" className="text-sm font-semibold text-zinc-900 underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">Task not found.</p>
        <Link href="/technician/tasks" className="text-sm font-semibold text-zinc-900 underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  const isActive = request.status !== "complete";

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/technician/tasks"
        className="inline-block text-sm font-semibold text-zinc-600 hover:text-zinc-900"
      >
        ← Back to Tasks
      </Link>
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">{request.title}</h1>
            <p className="mt-1 text-sm text-zinc-600">{request.description}</p>
            <p className="mt-2 text-xs text-zinc-500">
              Created {formatDateTime(request.createdAt)}
              {request.status ? ` · ${request.status.replaceAll("_", " ")}` : ""}
            </p>
            {requestUser ? (
              <p className="mt-1 text-xs text-zinc-500">
                User: {requestUser.name}
                {requestUser.building || requestUser.floor || requestUser.room
                  ? ` · ${[requestUser.building, requestUser.floor, requestUser.room].filter(Boolean).join("-")}`
                  : ""}
              </p>
            ) : null}
          </div>
          {isActive ? (
            <ChatPanel
              requestId={request.id}
              isActive={true}
              myRole="technician"
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              This task is completed. Chat is closed.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
