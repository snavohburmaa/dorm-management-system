export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, sessionCookieHeader } from "@/lib/session-server";

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { ok: false, error: "Database not configured." },
        { status: 503 }
      );
    }
    const body = await request.json();
    const { action, payload } = body as { action: string; payload: Record<string, unknown> };
    const session = await getSession();

    switch (action) {
      case "registerUser": {
        const { name, email, password, phone, building, floor, room } = (payload ?? {}) as Record<string, string>;
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !password) {
          return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
        }
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          return NextResponse.json({ ok: false, error: "Email already registered." }, { status: 400 });
        }
        const user = await prisma.user.create({
          data: {
            name: name ?? "",
            email: normalizedEmail,
            password,
            phone: phone ?? "",
            building: building ?? "",
            floor: floor ?? "",
            room: room ?? "",
          },
        });
        const sess = { role: "user" as const, id: user.id };
        const res = NextResponse.json({ ok: true, session: sess });
        res.headers.set("Set-Cookie", sessionCookieHeader(sess));
        return res;
      }

      case "registerTechnician": {
        const { name, email, password, phone } = (payload ?? {}) as Record<string, string>;
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !password) {
          return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
        }
        const existing = await prisma.technician.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          return NextResponse.json({ ok: false, error: "Email already registered." }, { status: 400 });
        }
        const tech = await prisma.technician.create({
          data: {
            name: name ?? "",
            email: normalizedEmail,
            password,
            phone: phone ?? "",
          },
        });
        const sess = { role: "technician" as const, id: tech.id };
        const res = NextResponse.json({ ok: true, session: sess });
        res.headers.set("Set-Cookie", sessionCookieHeader(sess));
        return res;
      }

      case "updateUserProfile": {
        if (!session || session.role !== "user") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { name, phone, building, floor, room } = (payload ?? {}) as Record<string, string | undefined>;
        await prisma.user.update({
          where: { id: session.id },
          data: {
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
            ...(building !== undefined && { building }),
            ...(floor !== undefined && { floor }),
            ...(room !== undefined && { room }),
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "updateTechnicianProfile": {
        if (!session || session.role !== "technician") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { name, phone } = (payload ?? {}) as Record<string, string | undefined>;
        await prisma.technician.update({
          where: { id: session.id },
          data: {
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "createRequest": {
        if (!session || session.role !== "user") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { title, description } = (payload ?? {}) as Record<string, string>;
        const req = await prisma.maintenanceRequest.create({
          data: {
            userId: session.id,
            title: title ?? "",
            description: description ?? "",
          },
        });
        await prisma.notification.create({
          data: {
            userId: session.id,
            requestId: req.id,
            type: "request_created",
            title: "Issue reported",
            message: "Your maintenance request was created and is pending assignment.",
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "assignTechnician": {
        if (!session || session.role !== "admin") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { requestId, technicianId } = (payload ?? {}) as { requestId: string; technicianId: string | null };
        await prisma.maintenanceRequest.update({
          where: { id: requestId },
          data: {
            assignedTechnicianId: technicianId ?? null,
            acceptedByTechnician: false,
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "setRequestPriority": {
        if (!session || session.role !== "admin") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { requestId, priority } = (payload ?? {}) as { requestId: string; priority: string };
        await prisma.maintenanceRequest.update({
          where: { id: requestId },
          data: { priority: priority ?? "medium" },
        });
        return NextResponse.json({ ok: true });
      }

      case "technicianAccept": {
        if (!session || session.role !== "technician") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { requestId } = (payload ?? {}) as { requestId: string };
        await prisma.requestDecline.deleteMany({
          where: { requestId, technicianId: session.id },
        });
        await prisma.maintenanceRequest.update({
          where: { id: requestId },
          data: { acceptedByTechnician: true },
        });
        return NextResponse.json({ ok: true });
      }

      case "technicianDecline": {
        if (!session || session.role !== "technician") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { requestId } = (payload ?? {}) as { requestId: string };
        await prisma.requestDecline.upsert({
          where: {
            requestId_technicianId: { requestId, technicianId: session.id },
          },
          create: { requestId, technicianId: session.id },
          update: {},
        });
        await prisma.maintenanceRequest.update({
          where: { id: requestId },
          data: {
            assignedTechnicianId: null,
            acceptedByTechnician: false,
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "technicianUpdate": {
        if (!session || session.role !== "technician") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { requestId, status, technicianNotes } = (payload ?? {}) as {
          requestId: string;
          status: string;
          technicianNotes?: string;
        };
        await prisma.maintenanceRequest.update({
          where: { id: requestId },
          data: {
            status: status ?? "pending",
            technicianNotes: technicianNotes ?? undefined,
          },
        });
        return NextResponse.json({ ok: true });
      }

      case "addAnnouncement": {
        if (!session || session.role !== "admin") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { title, body } = (payload ?? {}) as Record<string, string>;
        await prisma.announcement.create({
          data: { title: title ?? "", body: body ?? "" },
        });
        return NextResponse.json({ ok: true });
      }

      case "updateAnnouncement": {
        if (!session || session.role !== "admin") {
          return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }
        const { announcementId, title, body } = (payload ?? {}) as {
          announcementId: string;
          title: string;
          body: string;
        };
        await prisma.announcement.update({
          where: { id: announcementId },
          data: {
            ...(title !== undefined && { title }),
            ...(body !== undefined && { body }),
          },
        });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    const err = e as Error & { code?: string };
    console.error("API action error:", err?.message ?? err, err);
    const isDev = process.env.NODE_ENV === "development";
    const message =
      err?.code === "P1001"
        ? "Database is unreachable. Check DATABASE_URL."
        : isDev && err?.message
          ? err.message
          : "Server error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
