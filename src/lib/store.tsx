"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  Announcement,
  ChatMessage,
  MaintenanceRequest,
  NotificationItem,
  RequestPriority,
  RequestStatus,
  Session,
  TechnicianProfile,
  UserProfile,
} from "@/lib/types";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { FRONTEND_ONLY } from "@/lib/config";
import { createSeedData, id, nowIso, ADMIN_CREDENTIALS } from "@/lib/seed";

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
  }): Promise<{ ok: true } | { ok: false; error: string }>;
  loginUser(payload: { email: string; password: string }): Promise<{ ok: true } | { ok: false; error: string }>;

  registerTechnician(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ ok: true } | { ok: false; error: string }>;
  loginTechnician(payload: { email: string; password: string }): Promise<{ ok: true } | { ok: false; error: string }>;

  loginAdmin(payload: { email: string; password: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  logout(): Promise<void>;

  updateUserProfile(patch: Partial<Pick<UserProfile, "name" | "phone" | "building" | "floor" | "room">>): Promise<void>;
  updateTechnicianProfile(patch: Partial<Pick<TechnicianProfile, "name" | "phone">>): Promise<void>;

  createRequest(payload: { title: string; description: string; preferredAt?: string | null }): Promise<{ ok: true } | { ok: false; error: string }>;
  assignTechnician(payload: { requestId: string; technicianId: string | null }): Promise<void>;
  setRequestPriority(payload: { requestId: string; priority: RequestPriority }): Promise<void>;
  technicianAccept(payload: { requestId: string }): Promise<void>;
  technicianDecline(payload: { requestId: string }): Promise<void>;
  technicianUpdate(payload: { requestId: string; status: RequestStatus; technicianNotes: string }): Promise<void>;

  addAnnouncement(payload: { title: string; body: string }): Promise<void>;
  updateAnnouncement(payload: { announcementId: string; title: string; body: string }): Promise<void>;

  getChatMessages(requestId: string): Promise<
    { ok: true; messages: ChatMessage[]; chatOpen: boolean } | { ok: false; error: string }
  >;
  sendChatMessage(requestId: string, message: string): Promise<{ ok: true; message: ChatMessage } | { ok: false; error: string }>;

  /** Rehydrate session from cookie (e.g. after navigation when store was out of sync). */
  setSession(session: Session): void;
};

type DormStore = DormState & DormActions;

const DormContext = createContext<DormStore | null>(null);

const emptyState: Omit<DormState, "ready"> = {
  session: null,
  users: [],
  technicians: [],
  announcements: [],
  requests: [],
  notifications: [],
};

type PersistedState = {
  users: UserProfile[];
  technicians: TechnicianProfile[];
  announcements: Announcement[];
  requests: MaintenanceRequest[];
  notifications: NotificationItem[];
};

/** Fresh seed only; no localStorage. Stop/run again = full refresh. */
function getFreshSeedState(): PersistedState {
  const seed = createSeedData();
  return {
    users: seed.users,
    technicians: seed.technicians,
    announcements: seed.announcements,
    requests: seed.requests,
    notifications: seed.notifications,
  };
}

async function apiData(): Promise<DormState> {
  const res = await fetch("/api/data", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load data");
  const data = await res.json();
  return { ...data, ready: true };
}

export function DormProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DormState>(() => ({ ...emptyState, ready: false }));

  const refetchData = useCallback(async () => {
    if (FRONTEND_ONLY) {
      const data = getFreshSeedState();
      setState({ ...data, session: null, ready: true });
      return;
    }
    try {
      const data = await apiData();
      setState(data);
    } catch {
      setState((prev) => ({ ...prev, ready: true }));
    }
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  const registerUser = useCallback<DormActions["registerUser"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const email = payload.email?.trim().toLowerCase() ?? "";
        if (!email || !payload.password) return { ok: false, error: "Email and password required." };
        if (state.users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "Email already registered." };
        const createdAt = nowIso();
        const user: UserProfile = {
          id: id("usr"),
          role: "user",
          name: payload.name ?? "",
          phone: payload.phone ?? "",
          building: payload.building ?? "",
          floor: payload.floor ?? "",
          room: payload.room ?? "",
          email,
          password: payload.password,
          createdAt,
        };
        const next: PersistedState = {
          users: [user, ...state.users],
          technicians: state.technicians,
          announcements: state.announcements,
          requests: state.requests,
          notifications: state.notifications,
        };
        const session: Session = { role: "user", id: user.id };
        setState((prev) => ({ ...prev, ...next, session, ready: true }));
        return { ok: true };
      }
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "registerUser", payload }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Failed" };
        if (data.session) {
          setSessionCookie(data.session);
          setState((prev) => ({ ...prev, session: data.session, ready: true }));
        }
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const loginUser = useCallback<DormActions["loginUser"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const email = payload.email?.trim().toLowerCase() ?? "";
        const user = state.users.find((u) => u.email.toLowerCase() === email);
        if (!user || user.password !== payload.password) return { ok: false, error: "Invalid email or password." };
        const session: Session = { role: "user", id: user.id };
        setState((prev) => ({ ...prev, session, ready: true }));
        return { ok: true };
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: "user", email: payload.email, password: payload.password }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Invalid email or password." };
        if (data.session) {
          setSessionCookie(data.session);
          setState((prev) => ({ ...prev, session: data.session, ready: true }));
        }
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData, state.users],
  );

  const registerTechnician = useCallback<DormActions["registerTechnician"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const email = payload.email?.trim().toLowerCase() ?? "";
        if (!email || !payload.password) return { ok: false, error: "Email and password required." };
        if (state.technicians.some((t) => t.email.toLowerCase() === email)) return { ok: false, error: "Email already registered." };
        const createdAt = nowIso();
        const tech: TechnicianProfile = {
          id: id("tech"),
          role: "technician",
          name: payload.name ?? "",
          phone: payload.phone ?? "",
          email,
          password: payload.password,
          createdAt,
        };
        const next: PersistedState = {
          users: state.users,
          technicians: [tech, ...state.technicians],
          announcements: state.announcements,
          requests: state.requests,
          notifications: state.notifications,
        };
        const session: Session = { role: "technician", id: tech.id };
        setState((prev) => ({ ...prev, ...next, session, ready: true }));
        return { ok: true };
      }
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "registerTechnician", payload }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Failed" };
        if (data.session) {
          setSessionCookie(data.session);
          setState((prev) => ({ ...prev, session: data.session, ready: true }));
        }
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const loginTechnician = useCallback<DormActions["loginTechnician"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const email = payload.email?.trim().toLowerCase() ?? "";
        const tech = state.technicians.find((t) => t.email.toLowerCase() === email);
        if (!tech || tech.password !== payload.password) return { ok: false, error: "Invalid email or password." };
        const session: Session = { role: "technician", id: tech.id };
        setState((prev) => ({ ...prev, session, ready: true }));
        return { ok: true };
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: "technician", email: payload.email, password: payload.password }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Invalid email or password." };
        if (data.session) {
          setSessionCookie(data.session);
          setState((prev) => ({ ...prev, session: data.session, ready: true }));
        }
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData, state.technicians],
  );

  const loginAdmin = useCallback<DormActions["loginAdmin"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const email = payload.email?.trim().toLowerCase() ?? "";
        if (email !== ADMIN_CREDENTIALS.email || payload.password !== ADMIN_CREDENTIALS.password) {
          return { ok: false, error: "Invalid admin credentials." };
        }
        const session: Session = { role: "admin", id: "admin" };
        setState((prev) => ({ ...prev, session, ready: true }));
        return { ok: true };
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: "admin", email: payload.email, password: payload.password }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Invalid admin credentials." };
        if (data.session) {
          setSessionCookie(data.session);
          setState((prev) => ({ ...prev, session: data.session, ready: true }));
        }
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData],
  );

  const logout = useCallback(async () => {
    if (!FRONTEND_ONLY) await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearSessionCookie();
    setState((prev) => ({ ...emptyState, ready: prev.ready }));
    await refetchData();
  }, [refetchData]);

  const updateUserProfile = useCallback<DormActions["updateUserProfile"]>(
    async (patch) => {
      if (FRONTEND_ONLY) {
        if (!state.session || state.session.role !== "user") return;
        const users = state.users.map((u) =>
          u.id === state.session?.id ? { ...u, ...patch } : u
        );
        const next: PersistedState = { ...state, users };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateUserProfile", payload: patch }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.session, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const updateTechnicianProfile = useCallback<DormActions["updateTechnicianProfile"]>(
    async (patch) => {
      if (FRONTEND_ONLY) {
        if (!state.session || state.session.role !== "technician") return;
        const technicians = state.technicians.map((t) =>
          t.id === state.session?.id ? { ...t, ...patch } : t
        );
        const next: PersistedState = { ...state, technicians };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateTechnicianProfile", payload: patch }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.session, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const createRequest = useCallback<DormActions["createRequest"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        if (!state.session || state.session.role !== "user") return { ok: false, error: "Must be logged in as user." };
        const createdAt = nowIso();
        const request: MaintenanceRequest = {
          id: id("req"),
          userId: state.session.id,
          title: payload.title ?? "",
          description: payload.description ?? "",
          status: "pending",
          priority: "medium",
          preferredAt: payload.preferredAt ?? null,
          assignedTechnicianId: null,
          acceptedByTechnician: false,
          declinedByTechnicianIds: [],
          technicianNotes: "",
          createdAt,
          updatedAt: createdAt,
        };
        const notif: NotificationItem = {
          id: id("noti"),
          userId: state.session.id,
          requestId: request.id,
          type: "request_created",
          title: "Issue reported",
          message: "Your maintenance request was created and is pending assignment.",
          createdAt,
        };
        const next: PersistedState = {
          users: state.users,
          technicians: state.technicians,
          announcements: state.announcements,
          requests: [request, ...state.requests],
          notifications: [notif, ...state.notifications],
        };
        setState((prev) => ({ ...prev, ...next }));
        return { ok: true };
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "createRequest", payload }),
      });
      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error ?? "Failed" };
      await refetchData();
      return { ok: true };
    },
    [refetchData, state.session, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const assignTechnician = useCallback<DormActions["assignTechnician"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const requests = state.requests.map((r) =>
          r.id === payload.requestId ? { ...r, assignedTechnicianId: payload.technicianId, acceptedByTechnician: false } : r
        );
        const next: PersistedState = { ...state, requests };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "assignTechnician", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const setRequestPriority = useCallback<DormActions["setRequestPriority"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const requests = state.requests.map((r) =>
          r.id === payload.requestId ? { ...r, priority: payload.priority } : r
        );
        const next: PersistedState = { ...state, requests };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "setRequestPriority", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const technicianAccept = useCallback<DormActions["technicianAccept"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const requests = state.requests.map((r) =>
          r.id === payload.requestId ? { ...r, acceptedByTechnician: true, declinedByTechnicianIds: [] } : r
        );
        const next: PersistedState = { ...state, requests };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianAccept", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const technicianDecline = useCallback<DormActions["technicianDecline"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        if (!state.session || state.session.role !== "technician") return;
        const requests = state.requests.map((r) => {
          if (r.id !== payload.requestId) return r;
          const declined = r.declinedByTechnicianIds.includes(state.session!.id)
            ? r.declinedByTechnicianIds
            : [...r.declinedByTechnicianIds, state.session!.id];
          return { ...r, declinedByTechnicianIds: declined, assignedTechnicianId: null, acceptedByTechnician: false };
        });
        const next: PersistedState = { ...state, requests };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianDecline", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.session, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const technicianUpdate = useCallback<DormActions["technicianUpdate"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const requests = state.requests.map((r) =>
          r.id === payload.requestId
            ? { ...r, status: payload.status, technicianNotes: payload.technicianNotes ?? r.technicianNotes }
            : r
        );
        const next: PersistedState = { ...state, requests };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianUpdate", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const addAnnouncement = useCallback<DormActions["addAnnouncement"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const createdAt = nowIso();
        const announcement: Announcement = {
          id: id("ann"),
          title: payload.title ?? "",
          body: payload.body ?? "",
          createdAt,
          createdBy: "admin",
        };
        const next: PersistedState = {
          users: state.users,
          technicians: state.technicians,
          announcements: [announcement, ...state.announcements],
          requests: state.requests,
          notifications: state.notifications,
        };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "addAnnouncement", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const updateAnnouncement = useCallback<DormActions["updateAnnouncement"]>(
    async (payload) => {
      if (FRONTEND_ONLY) {
        const announcements = state.announcements.map((a) =>
          a.id === payload.announcementId ? { ...a, title: payload.title ?? a.title, body: payload.body ?? a.body } : a
        );
        const next: PersistedState = { ...state, announcements };
        setState((prev) => ({ ...prev, ...next }));
        return;
      }
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateAnnouncement", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData, state.users, state.technicians, state.announcements, state.requests, state.notifications],
  );

  const getChatMessages = useCallback<DormActions["getChatMessages"]>(async (requestId) => {
    if (FRONTEND_ONLY) return { ok: true, messages: [], chatOpen: false };
    const res = await fetch(`/api/chat?requestId=${encodeURIComponent(requestId)}`, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error ?? "Failed to load messages." };
    if (!data.ok) return { ok: false, error: data.error ?? "Failed to load messages." };
    return {
      ok: true,
      messages: data.messages ?? [],
      chatOpen: data.chatOpen !== false,
    };
  }, []);

  const sendChatMessage = useCallback<DormActions["sendChatMessage"]>(async (requestId, message) => {
    if (FRONTEND_ONLY) return { ok: false, error: "Chat not available offline." };
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ requestId, message }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error ?? "Failed to send." };
    if (!data.ok) return { ok: false, error: data.error ?? "Failed to send." };
    return { ok: true, message: data.message };
  }, []);

  const setSession = useCallback((session: Session) => {
    setState((prev) => ({ ...prev, session }));
  }, []);

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
      getChatMessages,
      sendChatMessage,
      setSession,
    }),
    [
      addAnnouncement,
      updateAnnouncement,
      getChatMessages,
      sendChatMessage,
      assignTechnician,
      createRequest,
      setRequestPriority,
      loginAdmin,
      loginTechnician,
      loginUser,
      logout,
      registerTechnician,
      registerUser,
      setSession,
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

