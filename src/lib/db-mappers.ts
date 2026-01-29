import type {
  Announcement,
  MaintenanceRequest,
  NotificationItem,
  TechnicianProfile,
  UserProfile,
} from "@/lib/types";

type DbUser = { id: string; name: string; phone: string; building: string; floor: string; room: string; email: string; password: string; createdAt: Date };
type DbTechnician = { id: string; name: string; phone: string; email: string; password: string; createdAt: Date };
type DbAnnouncement = { id: string; title: string; body: string; createdAt: Date };
type DbRequest = { id: string; userId: string; title: string; description: string; status: string; priority: string; assignedTechnicianId: string | null; acceptedByTechnician: boolean; technicianNotes: string; createdAt: Date; updatedAt: Date; declinedBy?: { technicianId: string }[] };
type DbNotification = { id: string; userId: string; requestId: string; type: string; title: string; message: string; createdAt: Date };

export function mapUser(u: DbUser): UserProfile {
  return {
    id: u.id,
    role: "user",
    name: u.name,
    phone: u.phone,
    building: u.building,
    floor: u.floor,
    room: u.room,
    email: u.email,
    password: u.password,
    createdAt: u.createdAt.toISOString(),
  };
}

export function mapTechnician(t: DbTechnician): TechnicianProfile {
  return {
    id: t.id,
    role: "technician",
    name: t.name,
    phone: t.phone,
    email: t.email,
    password: t.password,
    createdAt: t.createdAt.toISOString(),
  };
}

export function mapAnnouncement(a: DbAnnouncement): Announcement {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.createdAt.toISOString(),
    createdBy: "admin",
  };
}

export function mapRequest(r: DbRequest): MaintenanceRequest {
  const declinedByTechnicianIds =
    r.declinedBy?.map((d: { technicianId: string }) => d.technicianId) ?? [];
  return {
    id: r.id,
    userId: r.userId,
    title: r.title,
    description: r.description,
    status: r.status as MaintenanceRequest["status"],
    priority: r.priority as MaintenanceRequest["priority"],
    assignedTechnicianId: r.assignedTechnicianId ?? null,
    acceptedByTechnician: r.acceptedByTechnician,
    declinedByTechnicianIds,
    technicianNotes: r.technicianNotes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function mapNotification(n: DbNotification): NotificationItem {
  return {
    id: n.id,
    userId: n.userId,
    requestId: n.requestId,
    type: n.type as NotificationItem["type"],
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
  };
}
