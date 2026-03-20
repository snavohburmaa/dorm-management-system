"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { useDorm } from "@/lib/store";
import { formatChatTime } from "@/lib/format";

const POLL_INTERVAL_MS = 2500;

type Props = {
  requestId: string;
  /** Only show chat when request is not complete */
  isActive: boolean;
  /** "user" | "technician" - to align own messages */
  myRole: "user" | "technician";
  /** When false (e.g. user, tech not yet accepted), show waiting message and disable send */
  canSend?: boolean;
};

export function ChatPanel({ requestId, isActive, myRole, canSend: canSendProp }: Props) {
  const dorm = useDorm();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canSend = canSendProp !== undefined ? canSendProp : chatOpen;

  const fetchMessages = useCallback(async () => {
    const res = await dorm.getChatMessages(requestId);
    if (res.ok) {
      setMessages(res.messages);
      setChatOpen(res.chatOpen);
    }
  }, [dorm, requestId]);

  useEffect(() => {
    if (!isActive || !requestId) return;
    fetchMessages();
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isActive, requestId, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);
    const res = await dorm.sendChatMessage(requestId, text);
    setSending(false);
    if (res.ok) {
      setInput("");
      setMessages((prev) => [...prev, res.message]);
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    } else {
      setError(res.error ?? "Failed to send.");
    }
  }

  if (!isActive) return null;

  return (
    <div className="anim-enter overflow-hidden rounded-2xl border border-zinc-200/70 bg-white [box-shadow:var(--shadow-md)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
        <span className="inline-block size-2 rounded-full bg-emerald-400 [box-shadow:0_0_6px_rgba(52,211,153,0.6)]" />
        <span className="text-xs font-semibold text-zinc-600">Live chat</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-hide max-h-56 min-h-24 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <p className="py-3 text-center text-xs text-zinc-400">No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const isMe = m.senderRole === myRole;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    isMe
                      ? "rounded-br-sm bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.18)]"
                      : "rounded-bl-sm border border-zinc-100 bg-zinc-50 text-zinc-800 [box-shadow:var(--shadow-xs)]"
                  }`}
                >
                  {m.body}
                  <div
                    className="mt-1 text-[10px] opacity-50"
                    suppressHydrationWarning
                  >
                    {formatChatTime(m.createdAt)}
                    {!isMe ? ` · ${m.senderRole}` : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Waiting notice */}
      {!canSend ? (
        <div className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          {myRole === "user"
            ? "Chat opens once a technician is assigned and accepts the task."
            : "Accept the task on the Tasks page to start chatting."}
        </div>
      ) : null}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-zinc-100 bg-white p-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            canSend
              ? "Type a message…"
              : myRole === "user"
                ? "Waiting for technician…"
                : "Accept task to chat…"
          }
          disabled={!canSend}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-sm outline-none
            transition focus:border-zinc-400 focus:bg-white disabled:opacity-50"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!canSend || sending || !input.trim()}
          className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white
            transition-all duration-150 hover:-translate-y-px hover:[box-shadow:0_4px_12px_rgba(0,0,0,0.25)]
            disabled:translate-y-0 disabled:opacity-40 disabled:[box-shadow:none]"
        >
          {sending ? "…" : "Send"}
        </button>
      </form>

      {error ? (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
          {error}
        </div>
      ) : null}
    </div>
  );
}
