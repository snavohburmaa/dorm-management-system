"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

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

  createRequest(payload: { title: string; description: string }): Promise<{ ok: true } | { ok: false; error: string }>;
  assignTechnician(payload: { requestId: string; technicianId: string | null }): Promise<void>;
  setRequestPriority(payload: { requestId: string; priority: RequestPriority }): Promise<void>;
  technicianAccept(payload: { requestId: string }): Promise<void>;
  technicianDecline(payload: { requestId: string }): Promise<void>;
  technicianUpdate(payload: { requestId: string; status: RequestStatus; technicianNotes: string }): Promise<void>;

  addAnnouncement(payload: { title: string; body: string }): Promise<void>;
  updateAnnouncement(payload: { announcementId: string; title: string; body: string }): Promise<void>;
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

async function apiData(): Promise<DormState> {
  const res = await fetch("/api/data", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load data");
  const data = await res.json();
  return { ...data, ready: true };
}

export function DormProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DormState>(() => ({ ...emptyState, ready: false }));

  const refetchData = useCallback(async () => {
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
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "registerUser", payload }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Failed" };
        if (data.session) setSessionCookie(data.session);
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData],
  );

  const loginUser = useCallback<DormActions["loginUser"]>(
    async (payload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "user", email: payload.email, password: payload.password }),
      });
      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error ?? "Invalid email or password." };
      await refetchData();
      return { ok: true };
    },
    [refetchData],
  );

  const registerTechnician = useCallback<DormActions["registerTechnician"]>(
    async (payload) => {
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "registerTechnician", payload }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: "Invalid server response." }));
        if (!data.ok) return { ok: false, error: data.error ?? "Failed" };
        if (data.session) setSessionCookie(data.session);
        await refetchData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Network or server error." };
      }
    },
    [refetchData],
  );

  const loginTechnician = useCallback<DormActions["loginTechnician"]>(
    async (payload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "technician", email: payload.email, password: payload.password }),
      });
      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error ?? "Invalid email or password." };
      await refetchData();
      return { ok: true };
    },
    [refetchData],
  );

  const loginAdmin = useCallback<DormActions["loginAdmin"]>(
    async (payload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "admin", email: payload.email, password: payload.password }),
      });
      const data = await res.json();
      if (!data.ok) return { ok: false, error: data.error ?? "Invalid admin credentials." };
      await refetchData();
      return { ok: true };
    },
    [refetchData],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearSessionCookie();
    setState((prev) => ({ ...emptyState, ready: prev.ready }));
    await refetchData();
  }, [refetchData]);

  const updateUserProfile = useCallback<DormActions["updateUserProfile"]>(
    async (patch) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateUserProfile", payload: patch }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const updateTechnicianProfile = useCallback<DormActions["updateTechnicianProfile"]>(
    async (patch) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateTechnicianProfile", payload: patch }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const createRequest = useCallback<DormActions["createRequest"]>(
    async (payload) => {
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
    [refetchData],
  );

  const assignTechnician = useCallback<DormActions["assignTechnician"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "assignTechnician", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const setRequestPriority = useCallback<DormActions["setRequestPriority"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "setRequestPriority", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const technicianAccept = useCallback<DormActions["technicianAccept"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianAccept", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const technicianDecline = useCallback<DormActions["technicianDecline"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianDecline", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const technicianUpdate = useCallback<DormActions["technicianUpdate"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "technicianUpdate", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const addAnnouncement = useCallback<DormActions["addAnnouncement"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "addAnnouncement", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
  );

  const updateAnnouncement = useCallback<DormActions["updateAnnouncement"]>(
    async (payload) => {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "updateAnnouncement", payload }),
      });
      if (!res.ok) return;
      await refetchData();
    },
    [refetchData],
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

