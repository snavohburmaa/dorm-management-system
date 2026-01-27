"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { useDorm } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";

function toneForStatus(status: RequestStatus) {
  if (status === "pending") return "warning";
  if (status === "in_progress") return "info";
  return "success";
}

export default function UserProfilePage() {
  const dorm = useDorm();
  const user = useMemo(() => {
    if (dorm.session?.role !== "user") return null;
    return dorm.users.find((u) => u.id === dorm.session?.id) ?? null;
  }, [dorm.session, dorm.users]);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [building, setBuilding] = useState(user?.building ?? "");
  const [floor, setFloor] = useState(user?.floor ?? "");
  const [room, setRoom] = useState(user?.room ?? "");
  const [saved, setSaved] = useState(false);

  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueError, setIssueError] = useState<string | null>(null);

  useEffect(() => {
    // Keep form in sync with saved profile (e.g. after login or after save updates store).
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setBuilding(user.building ?? "");
    setFloor(user.floor ?? "");
    setRoom(user.room ?? "");
  }, [user]);

  function saveProfile() {
    dorm.updateUserProfile({ name, phone, building, floor, room });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function submitIssue() {
    setIssueError(null);
    const res = dorm.createRequest({ title: issueTitle, description: issueDescription });
    if (!res.ok) {
      setIssueError(res.error);
      return;
    }
    setIssueTitle("");
    setIssueDescription("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Edit your details, report an issue, and log out.
              </p>
            </div>
            {saved ? <Badge tone="success">Saved</Badge> : null}
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-zinc-600">Name</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {user?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-600">Phone</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {user?.phone || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-600">Building</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {user?.building || "—"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-600">Floor</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {user?.floor || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-600">Room</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {user?.room || "—"}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <div className="text-sm font-semibold">Your details</div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-600">Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-600">Phone</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-600">Building</div>
                  <Input value={building} onChange={(e) => setBuilding(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-600">Floor</div>
                  <Input value={floor} onChange={(e) => setFloor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-600">Room</div>
                  <Input value={room} onChange={(e) => setRoom(e.target.value)} />
                </div>
              </div>
            </div>

            <Button onClick={saveProfile} type="button">
              Save profile
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="text-sm font-semibold">Report an issue</div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Title</div>
              <Input
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g. Aircon not working"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Description</div>
              <Textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue..."
              />
            </div>

            {issueError ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {issueError}
              </div>
            ) : null}

            <Button onClick={submitIssue} type="button">
              Submit issue
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Logout</div>
            <div className="mt-1 text-sm text-zinc-600">
              Sign out of your account on this device.
            </div>
          </div>
          <Button variant="danger" onClick={dorm.logout} type="button">
            Logout
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="text-sm font-semibold">Your issues</div>
          <div className="text-sm text-zinc-600">
            Issues you submitted will show here.
          </div>

          <div className="space-y-3">
            {dorm.session?.role === "user" ? (
              dorm.requests
                .filter((r) => r.userId === dorm.session!.id)
                .map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold">{r.title}</div>
                          <div className="mt-2 text-sm text-zinc-700">
                            {r.description}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge tone={toneForStatus(r.status)}>
                              {r.status.replaceAll("_", " ")}
                            </Badge>
                            <span className="text-xs text-zinc-500">
                              Created: {formatDateTime(r.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
            ) : null}

            {dorm.session?.role === "user" &&
            dorm.requests.filter((r) => r.userId === dorm.session!.id).length ===
              0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                No issues submitted yet.
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

