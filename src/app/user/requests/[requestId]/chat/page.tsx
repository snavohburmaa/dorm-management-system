"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardBody } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";

export default function UserRequestChatPage() {
  const params = useParams();
  const requestId = typeof params.requestId === "string" ? params.requestId : "";
  const { requests, session } = useDorm();
  const request = requests.find((r) => r.id === requestId);

  if (session?.role !== "user") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">You must be logged in as a user.</p>
        <Link href="/user/requests" className="text-sm font-semibold text-zinc-900 underline">
          ← Back to Request list
        </Link>
      </div>
    );
  }

  if (!request || request.userId !== session.id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">Request not found.</p>
        <Link href="/user/requests" className="text-sm font-semibold text-zinc-900 underline">
          ← Back to Request list
        </Link>
      </div>
    );
  }

  const isActive = request.status !== "complete";

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/user/requests"
        className="inline-block text-sm font-semibold text-zinc-600 hover:text-zinc-900"
      >
        ← Back to Request list
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
          </div>
          {isActive ? (
            <ChatPanel
              requestId={request.id}
              isActive={true}
              myRole="user"
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              This request is completed. Chat is closed.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
