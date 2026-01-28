"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { useDorm } from "@/lib/store";

export default function TechnicianProfilePage() {
  const dorm = useDorm();
  const tech = useMemo(() => {
    if (dorm.session?.role !== "technician") return null;
    return dorm.technicians.find((t) => t.id === dorm.session?.id) ?? null;
  }, [dorm.session, dorm.technicians]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tech?.name ?? "");
  const [phone, setPhone] = useState(tech?.phone ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!tech) return;
    setName(tech.name ?? "");
    setPhone(tech.phone ?? "");
  }, [tech]);

  function saveProfile() {
    dorm.updateTechnicianProfile({ name, phone });
    setSaved(true);
    setIsEditing(false);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function cancelEdit() {
    if (!tech) return;
    setName(tech.name ?? "");
    setPhone(tech.phone ?? "");
    setIsEditing(false);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Log out. (Technicians cannot create issues.)
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
                  {tech?.name || "—"}
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
                  {tech?.phone || "—"}
                </div>
              )}
            </div>
          </div>
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

