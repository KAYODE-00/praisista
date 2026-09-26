"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cake, Send, X, Sparkles, Eye } from "lucide-react";

type ChatMessage = {
  id: number;
  authorName: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export default function BirthdayChat({
  onClose,
  userName,
}: {
  onClose: () => void;
  userName?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) return;

    const data = await res.json();
    setMessages(data.messages);
  }

  useEffect(() => {
    refresh();

    const timer = window.setInterval(refresh, 2500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function send() {
    const content = input;

    if (!content.length || sending) return;

    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          aiEnabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Unable to send message.");
      }

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex h-[100dvh] flex-col bg-[var(--bg)]/95 backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-[var(--gold)]">
            <Cake size={16} />
            <span className="text-xs uppercase tracking-[.25em]">
              Birthday chat
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiEnabled((enabled) => !enabled)}
              className={`rounded-full p-1.5 transition ${
                aiEnabled
                  ? "bg-[var(--gold)] text-[var(--choc)]"
                  : "text-white/35 hover:text-white/70"
              }`}
              aria-label="Toggle birthday magic"
            >
              <Sparkles size={15} />
            </button>

            <button
              onClick={onClose}
              className="text-white/35 transition hover:text-white/70"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto px-5 py-6 pb-28 text-left"
        >
          {messages.length === 0 && (
            <p className="my-auto text-center text-sm text-white/40">
              Be the first to leave a birthday note.
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`group relative flex max-w-[85%] items-start gap-2 rounded-2xl px-4 py-2 text-sm leading-6 ${
                m.role === "user" && m.authorName === userName
                  ? "self-end bg-[var(--frosting)]/20 text-[var(--cream)]"
                  : "self-start bg-white/[.06] text-white/80"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.16em] opacity-55">
                  {m.authorName}
                </p>
                <p className="break-words whitespace-pre-wrap">{m.content}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(m)}
                className="shrink-0 opacity-0 transition group-hover:opacity-100"
                aria-label="View full message"
              >
                <Eye size={14} className="text-white/50 hover:text-white/80" />
              </button>
            </div>
          ))}

          {sending && (
            <div className="self-end rounded-2xl bg-[var(--frosting)]/20 px-4 py-2 text-sm text-white/60">
              Sending…
            </div>
          )}
        </div>

        {error && (
          <p className="shrink-0 px-5 pb-1 text-xs text-red-300/80">
            {error}
          </p>
        )}

        <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/10 bg-[var(--bg)]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="write…"
              className="max-h-24 min-w-0 flex-1 resize-none rounded-2xl bg-white/[.05] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/[.08] whitespace-pre-wrap"
            />

            <button
              onClick={send}
              disabled={sending || !input.length}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--frosting-deep)] text-[var(--choc)] transition disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedMessage(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--bg)] border border-white/10 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/55">
                  {selectedMessage.authorName}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-white/35 transition hover:text-white/70"
                aria-label="Close full message view"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-sm leading-8 text-white/80 whitespace-pre-wrap break-words">
              {selectedMessage.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}