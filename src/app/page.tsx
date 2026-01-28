import Link from "next/link";
import { Wrench, UserRound, Shield } from "lucide-react";
import { Card, CardBody } from "@/components/Card";

export default function Home() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-zinc-600">
                Dorm Management
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Choose your role
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Select User or Technician to continue to login/register.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto sm:flex-shrink-0 sm:py-2"
            >
              <Shield className="size-4 shrink-0" />
              Admin login
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Link href="/auth/user" className="group">
            <Card className="transition group-hover:shadow-sm">
              <CardBody className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-3xl bg-zinc-100">
                  <UserRound className="size-6 text-zinc-900" />
                </div>
                <div>
                  <div className="text-lg font-semibold">User</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    View announcements, notifications, and report issues.
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/auth/technician" className="group">
            <Card className="transition group-hover:shadow-sm">
              <CardBody className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-3xl bg-zinc-100">
                  <Wrench className="size-6 text-zinc-900" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Technician</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Accept tasks, update status, and add repair notes.
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        <p className="text-xs leading-relaxed text-zinc-500">
          Demo credentials: user <code>u1</code> / <code>123</code>, technician{" "}
          <code>t1</code> / <code>123</code>, admin <code>a1</code> /{" "}
          <code>123</code>.
        </p>
      </main>
    </div>
  );
}
