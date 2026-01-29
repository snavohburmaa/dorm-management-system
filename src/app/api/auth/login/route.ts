import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, sessionCookieHeader } from "@/lib/session-server";
import { ADMIN_CREDENTIALS } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password } = body as { role: string; email: string; password: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
    }

    if (role === "admin") {
      if (
        normalizedEmail !== ADMIN_CREDENTIALS.email ||
        password !== ADMIN_CREDENTIALS.password
      ) {
        return NextResponse.json({ ok: false, error: "Invalid admin credentials." }, { status: 401 });
      }
      const session = { role: "admin" as const, id: "admin" };
      const res = NextResponse.json({ ok: true, session });
      res.headers.set("Set-Cookie", sessionCookieHeader(session));
      return res;
    }

    if (role === "user") {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });
      if (!user || user.password !== password) {
        return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
      }
      const session = { role: "user" as const, id: user.id };
      const res = NextResponse.json({ ok: true, session });
      res.headers.set("Set-Cookie", sessionCookieHeader(session));
      return res;
    }

    if (role === "technician") {
      const tech = await prisma.technician.findFirst({
        where: { email: normalizedEmail },
      });
      if (!tech || tech.password !== password) {
        return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
      }
      const session = { role: "technician" as const, id: tech.id };
      const res = NextResponse.json({ ok: true, session });
      res.headers.set("Set-Cookie", sessionCookieHeader(session));
      return res;
    }

    return NextResponse.json({ ok: false, error: "Invalid role." }, { status: 400 });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
