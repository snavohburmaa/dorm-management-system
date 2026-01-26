export type Role = "user" | "technician" | "admin";

export type RequestStatus = "pending" | "in_progress" | "complete";

export type Session =
  | {
      role: Role;
      id: string; // userId | technicianId | 'admin'
    }
  | null;

export type UserProfile = {
  id: string;
  role: "user";
  name: string;
  phone: string;
  building: string;
  floor: string;
  room: string;
  email: string;
  password: string;
  createdAt: string;
};

export type TechnicianProfile = {
  id: string;
  role: "technician";
  name: string;
  phone: string;
  email: string;
  password: string;
  createdAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  createdBy: "admin";
};

export type MaintenanceRequest = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: RequestStatus;
  assignedTechnicianId: string | null;
  acceptedByTechnician: boolean;
  technicianNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationItem = {
  id: string;
  userId: string;
  requestId: string;
  type: "technician_accept" | "status_update" | "request_created" | "assigned";
  title: string;
  message: string;
  createdAt: string;
};

