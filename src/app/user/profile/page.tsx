"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { useDorm } from "@/lib/store";

export default function UserProfilePage() {
  const dorm = useDorm();
  const user = useMemo(() => {
    if (dorm.session?.role !== "user") return null;
    return dorm.users.find((u) => u.id === dorm.session?.id) ?? null;
  }, [dorm.session, dorm.users]);

  const [isEditing, setIsEditing] = useState(false);
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
    setIsEditing(false);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function cancelEdit() {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setBuilding(user.building ?? "");
    setFloor(user.floor ?? "");
    setRoom(user.room ?? "");
    setIsEditing(false);
  }

  async function submitIssue() {
    setIssueError(null);
    const res = await dorm.createRequest({ title: issueTitle, description: issueDescription });
    if (!res.ok) {
      setIssueError(res.error);
      return;
    }
    setIssueTitle("");
    setIssueDescription("");
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Report an issue and log out.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saved ? <Badge tone="success">Saved</Badge> : null}
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} type="button" size="sm">
                  Edit your profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={cancelEdit} type="button" variant="secondary" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={saveProfile} type="button" size="sm">
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-zinc-600">Name</div>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {user?.name || "—"}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-600">Phone</div>
              {isEditing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {user?.phone || "—"}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-600">Building</div>
              {isEditing ? (
                <Input
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {user?.building || "—"}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zinc-600">Floor</div>
                {isEditing ? (
                  <Input
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {user?.floor || "—"}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-600">Room</div>
                {isEditing ? (
                  <Input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {user?.room || "—"}
                  </div>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
}

