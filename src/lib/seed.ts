import type {
  Announcement,
  MaintenanceRequest,
  NotificationItem,
  Session,
  TechnicianProfile,
  UserProfile,
} from "@/lib/types";

export const ADMIN_CREDENTIALS = {
  email: "adlogin123@dorm.local",
  password: "adlogin123@dorm.local",
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
    name: "u1",
    phone: "+95 9 000 000 000",
    building: "A",
    floor: "2",
    room: "204",
    email: "u1",
    password: "123",
    createdAt,
  };

  const demoTech: TechnicianProfile = {
    id: id("tech"),
    role: "technician",
    name: "t1",
    phone: "+95 9 111 111 111",
    email: "t1",
    password: "123",
    createdAt,
  };

  const announcements: Announcement[] = [];

  const requests: MaintenanceRequest[] = [
    {
      id: id("req"),
      userId: demoUser.id,
      title: "Water leak in bathroom",
      description: "There is a leak under the sink. Please check.",
      status: "pending",
      priority: "medium",
      assignedTechnicianId: null,
      acceptedByTechnician: false,
      declinedByTechnicianIds: [],
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

