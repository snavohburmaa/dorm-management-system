export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session-server";
import type { RequestPriority, RequestStatus } from "@/lib/types";

type ActionBody =
  | { action: "registerUser"; payload: { name: string; email: string; password: string; phone?: string; building?: string; floor?: string; room?: string } }
  | { action: "registerTechnician"; payload: { name: string; email: string; password: string; phone?: string } }
  | { action: "updateUserProfile"; payload: Partial<{ name: string; phone: string; building: string; floor: string; room: string }> }
  | { action: "updateTechnicianProfile"; payload: Partial<{ name: string; phone: string }> }
  | { action: "createRequest"; payload: { title: string; description: string } }
  | { action: "assignTechnician"; payload: { requestId: string; technicianId: string | null } }
  | { action: "setRequestPriority"; payload: { requestId: string; priority: RequestPriority } }
  | { action: "technicianAccept"; payload: { requestId: string } }
  | { action: "technicianDecline"; payload: { requestId: string } }
  | { action: "technicianUpdate"; payload: { requestId: string; status: RequestStatus; technicianNotes: string } }
  | { action: "addAnnouncement"; payload: { title: string; body: string } }
  | { action: "updateAnnouncement"; payload: { announcementId: string; title: string; body: string } };

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = (await request.json()) as ActionBody;
    const { action, payload } = body;

    if (action === "registerUser") {
      const email = payload.email.trim().toLowerCase();
      if (!email || !payload.password || !payload.name.trim()) {
        return NextResponse.json({ ok: false, error: "Please fill all required fields." }, { status: 400 });
      }
      const exists = await prisma.user.findFirst({ where: { email } });
      if (exists) return NextResponse.json({ ok: false, error: "Email already registered." }, { status: 400 });
      const user = await prisma.user.create({
        data: {
          name: payload.name.trim(),
          email,
          password: payload.password,
          phone: payload.phone?.trim() ?? "",
          building: payload.building?.trim() ?? "",
          floor: payload.floor?.trim() ?? "",
          room: payload.room?.trim() ?? "",
        },
      });
      return NextResponse.json({ ok: true, session: { role: "user" as const, id: user.id } });
    }

    if (action === "registerTechnician") {
      const email = payload.email.trim().toLowerCase();
      if (!email || !payload.password || !payload.name.trim()) {
        return NextResponse.json({ ok: false, error: "Please fill all required fields." }, { status: 400 });
      }
      const exists = await prisma.technician.findFirst({ where: { email } });
      if (exists) return NextResponse.json({ ok: false, error: "Email already registered." }, { status: 400 });
      const tech = await prisma.technician.create({
        data: {
          name: payload.name.trim(),
          email,
          password: payload.password,
          phone: payload.phone?.trim() ?? "",
        },
      });
      return NextResponse.json({ ok: true, session: { role: "technician" as const, id: tech.id } });
    }

    if (action === "updateUserProfile") {
      if (session?.role !== "user") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      await prisma.user.update({
        where: { id: session.id },
        data: {
          ...(payload.name != null && { name: payload.name }),
          ...(payload.phone != null && { phone: payload.phone }),
          ...(payload.building != null && { building: payload.building }),
          ...(payload.floor != null && { floor: payload.floor }),
          ...(payload.room != null && { room: payload.room }),
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "updateTechnicianProfile") {
      if (session?.role !== "technician") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      await prisma.technician.update({
        where: { id: session.id },
        data: {
          ...(payload.name != null && { name: payload.name }),
          ...(payload.phone != null && { phone: payload.phone }),
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "createRequest") {
      if (session?.role !== "user") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const title = payload.title.trim();
      const description = payload.description.trim();
      if (!title || !description) return NextResponse.json({ ok: false, error: "Please add title and description." }, { status: 400 });
      const req = await prisma.maintenanceRequest.create({
        data: { userId: session.id, title, description },
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

    if (action === "assignTechnician") {
      if (session?.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const { requestId, technicianId } = payload;
      const req = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
      if (!req || req.acceptedByTechnician) return NextResponse.json({ ok: true });
      await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: {
          assignedTechnicianId: technicianId,
          acceptedByTechnician: false,
        },
      });
      if (technicianId) {
        await prisma.notification.create({
          data: {
            userId: req.userId,
            requestId,
            type: "assigned",
            title: "Technician assigned",
            message: "A technician has been assigned to your request.",
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "setRequestPriority") {
      if (session?.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      await prisma.maintenanceRequest.update({
        where: { id: payload.requestId },
        data: { priority: payload.priority },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "technicianAccept") {
      if (session?.role !== "technician") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const { requestId } = payload;
      const req = await prisma.maintenanceRequest.findUnique({ where: { id: requestId }, include: { assignedTechnician: true } });
      if (!req || req.assignedTechnicianId !== session.id) return NextResponse.json({ ok: true });
      await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: { acceptedByTechnician: true },
      });
      const tech = req.assignedTechnician;
      await prisma.notification.create({
        data: {
          userId: req.userId,
          requestId,
          type: "technician_accept",
          title: "Technician accepted",
          message: tech ? `${tech.name} accepted your request. Phone: ${tech.phone || "—"}` : "A technician accepted your request.",
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "technicianDecline") {
      if (session?.role !== "technician") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const { requestId } = payload;
      const req = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
      if (!req || req.assignedTechnicianId !== session.id) return NextResponse.json({ ok: true });
      await prisma.requestDecline.upsert({
        where: { requestId_technicianId: { requestId, technicianId: session.id } },
        create: { requestId, technicianId: session.id },
        update: {},
      });
      await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: { assignedTechnicianId: null, acceptedByTechnician: false },
      });
      await prisma.notification.create({
        data: {
          userId: req.userId,
          requestId,
          type: "assigned",
          title: "Technician declined",
          message: "The assigned technician declined. Admin may assign another.",
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "technicianUpdate") {
      if (session?.role !== "technician") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const { requestId, status, technicianNotes } = payload;
      const req = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
      if (!req || req.assignedTechnicianId !== session.id) return NextResponse.json({ ok: true });
      await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: { status, technicianNotes },
      });
      await prisma.notification.create({
        data: {
          userId: req.userId,
          requestId,
          type: "status_update",
          title: "Issue updated",
          message: `Status changed to ${status.replaceAll("_", " ")}.`,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "addAnnouncement") {
      if (session?.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const title = payload.title.trim();
      const body = payload.body.trim();
      if (!title || !body) return NextResponse.json({ ok: false, error: "Title and body required." }, { status: 400 });
      await prisma.announcement.create({ data: { title, body } });
      return NextResponse.json({ ok: true });
    }

    if (action === "updateAnnouncement") {
      if (session?.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      const { announcementId, title, body } = payload;
      const t = title.trim();
      const b = body.trim();
      if (!t || !b) return NextResponse.json({ ok: false, error: "Title and body required." }, { status: 400 });
      await prisma.announcement.update({
        where: { id: announcementId },
        data: { title: t, body: b },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (e) {
    console.error("POST /api/action error:", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
