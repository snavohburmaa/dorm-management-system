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
    <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      <div className="border-b border-zinc-200 bg-white px-3 py-2">
        <span className="text-xs font-semibold text-zinc-600">Chat (live)</span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-48 min-h-24 overflow-y-auto p-3 space-y-2"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => {
            const isMe = m.senderRole === myRole;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    isMe
                      ? "bg-zinc-900 text-white rounded-br-md"
                      : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-md"
                  }`}
                >
                  <div>{m.body}</div>
                  <div
                    className={`mt-1 text-[10px] ${isMe ? "text-zinc-400" : "text-zinc-400"}`}
                    suppressHydrationWarning
                  >
                    {formatChatTime(m.createdAt)}
                    {isMe ? "" : ` · ${m.senderRole}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {!canSend && myRole === "user" ? (
        <div className="border-t border-zinc-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          Chat opens when admin assigns a technician and they accept this task.
        </div>
      ) : null}
      {!canSend && myRole === "technician" ? (
        <div className="border-t border-zinc-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          Accept the task on the Tasks page to start chatting with the user.
        </div>
      ) : null}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 bg-white p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
              canSend
                ? "Type a message..."
                : myRole === "user"
                  ? "Waiting for technician to accept..."
                  : "Accept the task to chat..."
            }
          disabled={!canSend}
          className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-zinc-400 disabled:opacity-60"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!canSend || sending || !input.trim()}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {error ? (
        <div className="bg-red-50 px-3 py-2 text-xs text-red-700 border-t border-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
