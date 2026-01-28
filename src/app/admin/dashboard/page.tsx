"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/Badge";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { X } from "lucide-react";

export default function AdminDashboardPage() {
  const dorm = useDorm();
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const selectedAnnouncement = useMemo(() => {
    if (!selectedAnnouncementId) return null;
    return dorm.announcements.find((a) => a.id === selectedAnnouncementId) ?? null;
  }, [dorm.announcements, selectedAnnouncementId]);

  const openEditModal = (id: string) => {
    const ann = dorm.announcements.find((a) => a.id === id);
    if (ann) {
      setSelectedAnnouncementId(id);
      setEditTitle(ann.title);
      setEditBody(ann.body);
    }
  };

  const closeEditModal = () => {
    setSelectedAnnouncementId(null);
    setEditTitle("");
    setEditBody("");
  };

  const saveAnnouncement = () => {
    if (!selectedAnnouncementId || !editTitle.trim() || !editBody.trim()) return;
    dorm.updateAnnouncement({
      announcementId: selectedAnnouncementId,
      title: editTitle,
      body: editBody,
    });
    closeEditModal();
  };

  const report = useMemo(() => {
    const byStatus = dorm.requests.reduce<Record<RequestStatus, number>>(
      (acc, r) => {
        acc[r.status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, complete: 0 },
    );
    return { byStatus };
  }, [dorm.requests]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dorm Control Center
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Manage residents and technicians,
            track maintenance requests, post updates, 
            and keep every room safe and comfortable.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/admin/users" className="block">
          <Card className="transition-colors hover:border-zinc-300 hover:bg-zinc-50/50">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Users and Technicians</div>
                <span className="text-xs font-medium text-zinc-500">
                  View all →
                </span>
              </div>
              <div className="text-sm text-zinc-600">
                {dorm.users.length} users, {dorm.technicians.length} technicians
              </div>
            </CardBody>
          </Card>
        </Link>

        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Reports</div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning">Pending: {report.byStatus.pending}</Badge>
              <Badge tone="info">In progress: {report.byStatus.in_progress}</Badge>
              <Badge tone="success">Complete: {report.byStatus.complete}</Badge>
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

        <Card>
          <CardBody className="space-y-3">
            <div className="text-sm font-semibold">Announcement history</div>
            <div className="text-sm text-zinc-600">
              Click an announcement to view and edit.
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-zinc-200">
              {dorm.announcements.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-zinc-500">
                  No announcements yet.
                </div>
              ) : (
                dorm.announcements.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openEditModal(a.id)}
                    className="w-full border-b border-zinc-100 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-50"
                  >
                    <div className="text-sm font-semibold text-zinc-900">{a.title}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {formatDateTime(a.createdAt)}
                    </div>
                    <span className="mt-1 inline-block text-xs font-medium text-zinc-500">
                      View / Edit →
                    </span>
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-edit-title"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="announcement-edit-title" className="text-lg font-semibold">
                    View / Edit announcement
                  </h2>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="text-xs text-zinc-500">
                  Posted: {formatDateTime(selectedAnnouncement.createdAt)}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-600">Title</div>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-600">Body</div>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Write announcement..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={saveAnnouncement} className="flex-1">
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeEditModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}

