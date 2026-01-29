import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session-server";
import {
  mapUser,
  mapTechnician,
  mapAnnouncement,
  mapRequest,
  mapNotification,
} from "@/lib/db-mappers";

export async function GET() {
  try {
    const session = await getSession();

    const [users, technicians, announcements, requestsDb, notificationsDb] =
      await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.technician.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.maintenanceRequest.findMany({
          include: { declinedBy: { select: { technicianId: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
      ]);

    let requests = requestsDb.map(mapRequest);
    let notifications = notificationsDb.map(mapNotification);

    if (session?.role === "user") {
      requests = requests.filter((r) => r.userId === session.id);
      notifications = notifications.filter((n) => n.userId === session.id);
    } else if (session?.role === "technician") {
      requests = requests.filter((r) => r.assignedTechnicianId === session.id);
      notifications = [];
    }
    // admin: all requests and notifications (notifications are per-user; admin may want all for dashboard - keep all)
    // For admin we show all. For notifications we could filter to "all" or leave as-is; store currently has all notifications. Leave all for admin.

    const data = {
      session,
      users: users.map(mapUser),
      technicians: technicians.map(mapTechnician),
      announcements: announcements.map(mapAnnouncement),
      requests,
      notifications,
    };

    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/data error:", e);
    return NextResponse.json(
      { error: "Failed to load data." },
      { status: 500 }
    );
  }
}
