"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cake, Send, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const AI_NAME = "Sugar";
const SESSION_STORAGE_KEY = "birthday-chat-session-id";

function getChatSessionId() {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export default function BirthdayChat({ onClose, userName }: { onClose: () => void; userName?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm Sugar 🍰 — I heard someone's having a birthday. What's the vibe today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError(null);

    try {
      sessionIdRef.current ??= getChatSessionId();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiName: AI_NAME, messages: next, sessionId: sessionIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="mx-auto mt-8 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[.045] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-[var(--gold)]">
          <Cake size={16} />
          <span className="text-xs uppercase tracking-[.25em]">Birthday chat</span>
        </div>
        <button onClick={onClose} className="text-white/35 transition hover:text-white/70" aria-label="Close chat">
          <X size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto px-5 py-4 text-left">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-6 ${
              m.role === "user"
                ? "self-end bg-[var(--frosting)]/20 text-[var(--cream)]"
                : "self-start bg-white/[.06] text-white/80"
            }`}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.16em] opacity-55">
              {m.role === "assistant" ? AI_NAME : userName?.trim() || "You"}
            </p>
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="self-start rounded-2xl bg-white/[.06] px-4 py-2 text-sm text-white/40">
            {AI_NAME} is typing…
          </div>
        )}
      </div>

      {error && <p className="px-5 pb-1 text-xs text-red-300/80">{error}</p>}

      <div className="flex items-end gap-2 border-t border-white/10 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Say something…"
          className="max-h-24 flex-1 resize-none rounded-2xl bg-white/[.05] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:bg-white/[.08]"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--frosting-deep)] text-[var(--choc)] transition disabled:opacity-40"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
