export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session-server";

/** User can only chat after admin assigned a technician and the technician accepted. */
function canAccessChat(
  session: { role: string; id: string } | null,
  request: { userId: string; assignedTechnicianId: string | null; acceptedByTechnician: boolean }
): boolean {
  if (!session) return false;
  if (session.role === "user")
    return (
      request.userId === session.id &&
      !!request.assignedTechnicianId &&
      request.acceptedByTechnician
    );
  if (session.role === "technician")
    return request.assignedTechnicianId === session.id && request.acceptedByTechnician;
  return false;
}

function canViewRequestAsUser(
  session: { role: string; id: string } | null,
  request: { userId: string }
): boolean {
  return !!session && session.role === "user" && request.userId === session.id;
}

export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
    }
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    if (!requestId?.trim()) {
      return NextResponse.json({ ok: false, error: "requestId required." }, { status: 400 });
    }
    const session = await getSession();
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      select: { userId: true, assignedTechnicianId: true, acceptedByTechnician: true, status: true },
    });
    if (!maintenanceRequest) {
      return NextResponse.json({ ok: false, error: "Request not found." }, { status: 404 });
    }
    const chatOpen = canAccessChat(session, maintenanceRequest);
    const userCanView = canViewRequestAsUser(session, maintenanceRequest);
    if (!chatOpen && !userCanView && session?.role !== "technician") {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
    }
    if (session?.role === "technician" && maintenanceRequest.assignedTechnicianId !== session.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
    }
    const messages = chatOpen
      ? await prisma.requestChatMessage.findMany({
          where: { requestId },
          orderBy: { createdAt: "asc" },
        })
      : [];
    const list = messages.map((m) => ({
      id: m.id,
      requestId: m.requestId,
      senderRole: m.senderRole as "user" | "technician",
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    }));
    return NextResponse.json({
      ok: true,
      messages: list,
      chatOpen: !!chatOpen,
    });
  } catch (e) {
    console.error("GET /api/chat error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
    }
    const session = await getSession();
    if (!session || (session.role !== "user" && session.role !== "technician")) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { requestId, message } = body as { requestId?: string; message?: string };
    if (!requestId?.trim() || typeof message !== "string") {
      return NextResponse.json({ ok: false, error: "requestId and message required." }, { status: 400 });
    }
    const trimmed = message.trim();
    if (!trimmed) {
      return NextResponse.json({ ok: false, error: "Message cannot be empty." }, { status: 400 });
    }
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      select: { userId: true, assignedTechnicianId: true, acceptedByTechnician: true, status: true },
    });
    if (!maintenanceRequest) {
      return NextResponse.json({ ok: false, error: "Request not found." }, { status: 404 });
    }
    if (maintenanceRequest.status === "complete") {
      return NextResponse.json({ ok: false, error: "Chat is closed for completed requests." }, { status: 400 });
    }
    if (!canAccessChat(session, maintenanceRequest)) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 403 });
    }
    const senderRole = session.role as "user" | "technician";
    const created = await prisma.requestChatMessage.create({
      data: {
        requestId,
        senderRole,
        senderId: session.id,
        body: trimmed.slice(0, 4000),
      },
    });
    return NextResponse.json({
      ok: true,
      message: {
        id: created.id,
        requestId: created.requestId,
        senderRole: created.senderRole as "user" | "technician",
        senderId: created.senderId,
        body: created.body,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("POST /api/chat error:", e);
    return NextResponse.json({ ok: false, error: "Failed to send message." }, { status: 500 });
  }
}
