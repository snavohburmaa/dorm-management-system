"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  Announcement,
  MaintenanceRequest,
  NotificationItem,
  RequestPriority,
  RequestStatus,
  Session,
  TechnicianProfile,
  UserProfile,
} from "@/lib/types";
import { ADMIN_CREDENTIALS, createSeedData } from "@/lib/seed";

type DormState = {
  ready: boolean;
  session: Session;
  users: UserProfile[];
  technicians: TechnicianProfile[];
  announcements: Announcement[];
  requests: MaintenanceRequest[];
  notifications: NotificationItem[];
};

type DormActions = {
  registerUser(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    building?: string;
    floor?: string;
    room?: string;
  }): { ok: true } | { ok: false; error: string };
  loginUser(payload: { email: string; password: string }): { ok: true } | { ok: false; error: string };

  registerTechnician(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): { ok: true } | { ok: false; error: string };
  loginTechnician(payload: { email: string; password: string }): { ok: true } | { ok: false; error: string };

  loginAdmin(payload: { email: string; password: string }): { ok: true } | { ok: false; error: string };
  logout(): void;

  updateUserProfile(patch: Partial<Pick<UserProfile, "name" | "phone" | "building" | "floor" | "room">>): void;
  updateTechnicianProfile(patch: Partial<Pick<TechnicianProfile, "name" | "phone">>): void;

  createRequest(payload: { title: string; description: string }): { ok: true } | { ok: false; error: string };
  assignTechnician(payload: { requestId: string; technicianId: string | null }): void;
  setRequestPriority(payload: { requestId: string; priority: RequestPriority }): void;
  technicianAccept(payload: { requestId: string }): void;
  technicianDecline(payload: { requestId: string }): void;
  technicianUpdate(payload: { requestId: string; status: RequestStatus; technicianNotes: string }): void;

  addAnnouncement(payload: { title: string; body: string }): void;
  updateAnnouncement(payload: { announcementId: string; title: string; body: string }): void;
};

type DormStore = DormState & DormActions;

const DormContext = createContext<DormStore | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function DormProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DormState>(() => {
    // In-memory only (NO localStorage persistence).
    // Refresh/restart = fresh seeded data.
    const seed = createSeedData();
    return { ...seed, ready: true };
  });

  const setAndPersist = useCallback((updater: (prev: Omit<DormState, "ready">) => Omit<DormState, "ready">) => {
    setState((prev) => {
      const base: Omit<DormState, "ready"> = {
        session: prev.session,
        users: prev.users,
        technicians: prev.technicians,
        announcements: prev.announcements,
        requests: prev.requests,
        notifications: prev.notifications,
      };
      const next = updater(base);
      return { ...next, ready: true };
    });
  }, []);

  const registerUser = useCallback<DormActions["registerUser"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      if (!email || !payload.password || !payload.name.trim()) {
        return { ok: false, error: "Please fill all required fields." };
      }

      const exists = state.users.some((u) => u.email.toLowerCase() === email);
      if (exists) return { ok: false, error: "Email already registered." };

      const user: UserProfile = {
        id: id("usr"),
        role: "user",
        name: payload.name.trim(),
        phone: payload.phone?.trim() || "",
        building: payload.building?.trim() || "",
        floor: payload.floor?.trim() || "",
        room: payload.room?.trim() || "",
        email,
        password: payload.password,
        createdAt: nowIso(),
      };

      setAndPersist((prev) => ({
        ...prev,
        session: { role: "user", id: user.id },
        users: [user, ...prev.users],
      }));

      return { ok: true };
    },
    [setAndPersist, state.users],
  );

  const loginUser = useCallback<DormActions["loginUser"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      const user = state.users.find((u) => u.email.toLowerCase() === email);
      if (!user || user.password !== payload.password) {
        return { ok: false, error: "Invalid email or password." };
      }
      setAndPersist((prev) => ({ ...prev, session: { role: "user", id: user.id } }));
      return { ok: true };
    },
    [setAndPersist, state.users],
  );

  const registerTechnician = useCallback<DormActions["registerTechnician"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      if (!email || !payload.password || !payload.name.trim()) {
        return { ok: false, error: "Please fill all required fields." };
      }
      const exists = state.technicians.some((t) => t.email.toLowerCase() === email);
      if (exists) return { ok: false, error: "Email already registered." };

      const technician: TechnicianProfile = {
        id: id("tech"),
        role: "technician",
        name: payload.name.trim(),
        phone: payload.phone?.trim() || "",
        email,
        password: payload.password,
        createdAt: nowIso(),
      };

      setAndPersist((prev) => ({
        ...prev,
        session: { role: "technician", id: technician.id },
        technicians: [technician, ...prev.technicians],
      }));

      return { ok: true };
    },
    [setAndPersist, state.technicians],
  );

  const loginTechnician = useCallback<DormActions["loginTechnician"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      const tech = state.technicians.find((t) => t.email.toLowerCase() === email);
      if (!tech || tech.password !== payload.password) {
        return { ok: false, error: "Invalid email or password." };
      }
      setAndPersist((prev) => ({ ...prev, session: { role: "technician", id: tech.id } }));
      return { ok: true };
    },
    [setAndPersist, state.technicians],
  );

  const loginAdmin = useCallback<DormActions["loginAdmin"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      if (email !== ADMIN_CREDENTIALS.email || payload.password !== ADMIN_CREDENTIALS.password) {
        return { ok: false, error: "Invalid admin credentials." };
      }
      setAndPersist((prev) => ({ ...prev, session: { role: "admin", id: "admin" } }));
      return { ok: true };
    },
    [setAndPersist],
  );

  const logout = useCallback(() => {
    setAndPersist((prev) => ({ ...prev, session: null }));
  }, [setAndPersist]);

  const updateUserProfile = useCallback<DormActions["updateUserProfile"]>(
    (patch) => {
      if (state.session?.role !== "user") return;
      const userId = state.session.id;
      setAndPersist((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
      }));
    },
    [setAndPersist, state.session],
  );

  const updateTechnicianProfile = useCallback<DormActions["updateTechnicianProfile"]>(
    (patch) => {
      if (state.session?.role !== "technician") return;
      const techId = state.session.id;
      setAndPersist((prev) => ({
        ...prev,
        technicians: prev.technicians.map((t) => (t.id === techId ? { ...t, ...patch } : t)),
      }));
    },
    [setAndPersist, state.session],
  );

  const createRequest = useCallback<DormActions["createRequest"]>(
    (payload) => {
      if (state.session?.role !== "user") return { ok: false, error: "Not authorized." };
      const title = payload.title.trim();
      const description = payload.description.trim();
      if (!title || !description) return { ok: false, error: "Please add title and description." };

      const createdAt = nowIso();
      const request: MaintenanceRequest = {
        id: id("req"),
        userId: state.session.id,
        title,
        description,
        status: "pending",
        priority: "medium",
        assignedTechnicianId: null,
        acceptedByTechnician: false,
        declinedByTechnicianIds: [],
        technicianNotes: "",
        createdAt,
        updatedAt: createdAt,
      };

      const noti: NotificationItem = {
        id: id("noti"),
        userId: request.userId,
        requestId: request.id,
        type: "request_created",
        title: "Issue reported",
        message: "Your maintenance request was created and is pending assignment.",
        createdAt,
      };

      setAndPersist((prev) => ({
        ...prev,
        requests: [request, ...prev.requests],
        notifications: [noti, ...prev.notifications],
      }));
      return { ok: true };
    },
    [setAndPersist, state.session],
  );

  const assignTechnician = useCallback<DormActions["assignTechnician"]>(
    ({ requestId, technicianId }) => {
      if (state.session?.role !== "admin") return;
      const createdAt = nowIso();

      setAndPersist((prev) => {
        const req = prev.requests.find((r) => r.id === requestId);
        if (!req) return prev;
        if (req.acceptedByTechnician) return prev;

        const updated: MaintenanceRequest = {
          ...req,
          assignedTechnicianId: technicianId,
          acceptedByTechnician: false,
          declinedByTechnicianIds: req.declinedByTechnicianIds ?? [],
          updatedAt: createdAt,
        };

        const notifications = [...prev.notifications];
        if (technicianId) {
          notifications.unshift({
            id: id("noti"),
            userId: updated.userId,
            requestId: updated.id,
            type: "assigned",
            title: "Technician assigned",
            message: "A technician has been assigned to your request.",
            createdAt,
          });
        }

        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? updated : r)),
          notifications,
        };
      });
    },
    [setAndPersist, state.session],
  );

  const setRequestPriority = useCallback<DormActions["setRequestPriority"]>(
    ({ requestId, priority }) => {
      if (state.session?.role !== "admin") return;
      const now = nowIso();
      setAndPersist((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === requestId ? { ...r, priority, updatedAt: now } : r
        ),
      }));
    },
    [setAndPersist, state.session],
  );

  const technicianAccept = useCallback<DormActions["technicianAccept"]>(
    ({ requestId }) => {
      if (state.session?.role !== "technician") return;
      const techId = state.session.id;
      const createdAt = nowIso();

      setAndPersist((prev) => {
        const req = prev.requests.find((r) => r.id === requestId);
        if (!req) return prev;
        if (req.assignedTechnicianId !== techId) return prev;

        const tech = prev.technicians.find((t) => t.id === techId);
        const updated: MaintenanceRequest = {
          ...req,
          acceptedByTechnician: true,
          updatedAt: createdAt,
        };

        const noti: NotificationItem = {
          id: id("noti"),
          userId: updated.userId,
          requestId: updated.id,
          type: "technician_accept",
          title: "Technician accepted",
          message: tech
            ? `${tech.name} accepted your request. Phone: ${tech.phone || "—"}`
            : "A technician accepted your request.",
          createdAt,
        };

        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? updated : r)),
          notifications: [noti, ...prev.notifications],
        };
      });
    },
    [setAndPersist, state.session],
  );

  const technicianDecline = useCallback<DormActions["technicianDecline"]>(
    ({ requestId }) => {
      if (state.session?.role !== "technician") return;
      const techId = state.session.id;
      const createdAt = nowIso();

      setAndPersist((prev) => {
        const req = prev.requests.find((r) => r.id === requestId);
        if (!req) return prev;
        if (req.assignedTechnicianId !== techId) return prev;

        const declinedIds = [...(req.declinedByTechnicianIds ?? []), techId];
        const updated: MaintenanceRequest = {
          ...req,
          assignedTechnicianId: null,
          acceptedByTechnician: false,
          declinedByTechnicianIds: declinedIds,
          updatedAt: createdAt,
        };

        const noti: NotificationItem = {
          id: id("noti"),
          userId: updated.userId,
          requestId: updated.id,
          type: "assigned",
          title: "Technician declined",
          message: "The assigned technician declined. Admin may assign another.",
          createdAt,
        };

        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? updated : r)),
          notifications: [noti, ...prev.notifications],
        };
      });
    },
    [setAndPersist, state.session],
  );

  const technicianUpdate = useCallback<DormActions["technicianUpdate"]>(
    ({ requestId, status, technicianNotes }) => {
      if (state.session?.role !== "technician") return;
      const techId = state.session.id;
      const createdAt = nowIso();

      setAndPersist((prev) => {
        const req = prev.requests.find((r) => r.id === requestId);
        if (!req) return prev;
        if (req.assignedTechnicianId !== techId) return prev;

        const updated: MaintenanceRequest = {
          ...req,
          status,
          technicianNotes,
          updatedAt: createdAt,
        };

        const noti: NotificationItem = {
          id: id("noti"),
          userId: updated.userId,
          requestId: updated.id,
          type: "status_update",
          title: "Issue updated",
          message: `Status changed to ${status.replaceAll("_", " ")}.`,
          createdAt,
        };

        return {
          ...prev,
          requests: prev.requests.map((r) => (r.id === requestId ? updated : r)),
          notifications: [noti, ...prev.notifications],
        };
      });
    },
    [setAndPersist, state.session],
  );

  const addAnnouncement = useCallback<DormActions["addAnnouncement"]>(
    ({ title, body }) => {
      if (state.session?.role !== "admin") return;
      const announcement: Announcement = {
        id: id("ann"),
        title: title.trim(),
        body: body.trim(),
        createdAt: nowIso(),
        createdBy: "admin",
      };

      if (!announcement.title || !announcement.body) return;

      setAndPersist((prev) => ({
        ...prev,
        announcements: [announcement, ...prev.announcements],
      }));
    },
    [setAndPersist, state.session],
  );

  const updateAnnouncement = useCallback<DormActions["updateAnnouncement"]>(
    ({ announcementId, title, body }) => {
      if (state.session?.role !== "admin") return;
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      if (!trimmedTitle || !trimmedBody) return;

      setAndPersist((prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) =>
          a.id === announcementId
            ? { ...a, title: trimmedTitle, body: trimmedBody }
            : a
        ),
      }));
    },
    [setAndPersist, state.session],
  );

  const value: DormStore = useMemo(
    () => ({
      ...state,
      registerUser,
      loginUser,
      registerTechnician,
      loginTechnician,
      loginAdmin,
      logout,
      updateUserProfile,
      updateTechnicianProfile,
      createRequest,
      assignTechnician,
      setRequestPriority,
      technicianAccept,
      technicianDecline,
      technicianUpdate,
      addAnnouncement,
      updateAnnouncement,
    }),
    [
      addAnnouncement,
      updateAnnouncement,
      assignTechnician,
      createRequest,
      setRequestPriority,
      loginAdmin,
      loginTechnician,
      loginUser,
      logout,
      registerTechnician,
      registerUser,
      state,
      technicianAccept,
      technicianDecline,
      technicianUpdate,
      updateTechnicianProfile,
      updateUserProfile,
    ],
  );

  return <DormContext.Provider value={value}>{children}</DormContext.Provider>;
}

export function useDorm() {
  const ctx = useContext(DormContext);
  if (!ctx) throw new Error("useDorm must be used within DormProvider");
  return ctx;
}

