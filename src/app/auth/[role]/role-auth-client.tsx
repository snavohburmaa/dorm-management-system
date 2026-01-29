"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useDorm } from "@/lib/store";
import type { Role } from "@/lib/types";

function roleLabel(role: Role) {
  return role === "user" ? "User" : "Technician";
}

function defaultRoute(role: Role) {
  return role === "user" ? "/user/announcements" : "/technician/tasks";
}

export function RoleAuthClient({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const router = useRouter();
  const dorm = useDorm();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState<Role>("user");

  useEffect(() => {
    (async () => {
      const p = await params;
      const raw = p.role;
      setRole(raw === "technician" ? "technician" : "user");
    })();
  }, [params]);

  useEffect(() => {
    if (!dorm.ready) return;
    if (dorm.session?.role === "user") router.replace("/user/announcements");
    if (dorm.session?.role === "technician") router.replace("/technician/tasks");
    if (dorm.session?.role === "admin") router.replace("/admin/dashboard");
  }, [dorm.ready, dorm.session, router]);

  const title = useMemo(() => `${roleLabel(role)} ${mode}`, [mode, role]);

  async function onSubmit() {
    setError(null);
    if (mode === "login") {
      const res =
        role === "user"
          ? await dorm.loginUser({ email, password })
          : await dorm.loginTechnician({ email, password });
      if (!res.ok) setError(res.error);
      else router.replace(defaultRoute(role));
      return;
    }

    const res =
      role === "user"
        ? await dorm.registerUser({ name, email, password, phone })
        : await dorm.registerTechnician({ name, email, password, phone });
    if (!res.ok) setError(res.error);
    else router.replace(defaultRoute(role));
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 sm:px-5 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-sm font-semibold text-zinc-700 hover:text-zinc-950">
            ← Back
          </Link>
          <div className="inline-flex w-full justify-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-zinc-200 sm:w-auto">
            <button
              className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                mode === "login" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                mode === "register" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>
        </div>

        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-zinc-600">
              {roleLabel(role)}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-zinc-600">
              {mode === "register"
                ? "After register, you will go to the next page directly."
                : "Login to continue."}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            {mode === "register" ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-600">Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Password</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {mode === "register" ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-600">Phone (optional)</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+95 9 ..." />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </div>
            ) : null}

            <Button className="w-full" onClick={onSubmit} type="button">
              {mode === "register" ? "Create account" : "Login"}
            </Button>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

