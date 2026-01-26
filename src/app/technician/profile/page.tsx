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
    window.setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Edit your details and log out. (Technicians cannot create issues.)
              </p>
            </div>
            {saved ? <Badge tone="success">Saved</Badge> : null}
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-zinc-600">Name</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {tech?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-600">Phone</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {tech?.phone || "—"}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

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
          </div>

          <Button onClick={saveProfile} type="button">
            Save profile
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

