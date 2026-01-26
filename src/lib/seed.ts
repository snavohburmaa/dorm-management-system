import type {
  Announcement,
  MaintenanceRequest,
  NotificationItem,
  Session,
  TechnicianProfile,
  UserProfile,
} from "@/lib/types";

export const ADMIN_CREDENTIALS = {
  email: "admin@dorm.local",
  password: "admin123",
} as const;

export type SeedData = {
  session: Session;
  users: UserProfile[];
  technicians: TechnicianProfile[];
  announcements: Announcement[];
  requests: MaintenanceRequest[];
  notifications: NotificationItem[];
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function createSeedData(): SeedData {
  const createdAt = nowIso();

  const demoUser: UserProfile = {
    id: id("usr"),
    role: "user",
    name: "Demo User",
    phone: "+95 9 000 000 000",
    building: "A",
    floor: "2",
    room: "204",
    email: "user@dorm.local",
    password: "user123",
    createdAt,
  };

  const demoTech: TechnicianProfile = {
    id: id("tech"),
    role: "technician",
    name: "Demo Technician",
    phone: "+95 9 111 111 111",
    email: "tech@dorm.local",
    password: "tech123",
    createdAt,
  };

  const announcements: Announcement[] = [
    {
      id: id("ann"),
      title: "Welcome to Dorm Management",
      body: "Admins can post announcements here. Users can read them like a post feed.",
      createdAt,
      createdBy: "admin",
    },
  ];

  const requests: MaintenanceRequest[] = [
    {
      id: id("req"),
      userId: demoUser.id,
      title: "Water leak in bathroom",
      description: "There is a leak under the sink. Please check.",
      status: "pending",
      assignedTechnicianId: null,
      acceptedByTechnician: false,
      technicianNotes: "",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: id("noti"),
      userId: demoUser.id,
      requestId: requests[0].id,
      type: "request_created",
      title: "Issue reported",
      message: "Your maintenance request was created and is pending assignment.",
      createdAt,
    },
  ];

  return {
    session: null,
    users: [demoUser],
    technicians: [demoTech],
    announcements,
    requests,
    notifications,
  };
}

