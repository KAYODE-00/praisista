"use client";
import { FormEvent, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/gallery";
import type { GroupMessage } from "@/lib/db";
import { Image, MessageSquare, Type, Trash2, Save, RefreshCw, X } from "lucide-react";

type Tab = "gallery" | "texts" | "chat";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("gallery");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <p className="text-xs uppercase tracking-[.25em] text-[var(--gold)]">Admin</p>
      <h1 className="mt-2 text-4xl font-semibold">Dashboard</h1>

      {/* Tab Navigation */}
      <div className="mt-8 flex gap-1 rounded-2xl border border-white/10 bg-white/[.03] p-1">
        {([
          { key: "gallery" as Tab, label: "Gallery", icon: <Image size={14} /> },
          { key: "texts" as Tab, label: "Site Texts", icon: <Type size={14} /> },
          { key: "chat" as Tab, label: "Chat", icon: <MessageSquare size={14} /> },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-[var(--gold)] text-[var(--choc)] shadow-[0_0_20px_rgba(255,207,122,.15)]"
                : "text-white/50 hover:text-white/80 hover:bg-white/[.05]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gallery" && <GalleryTab />}
      {tab === "texts" && <TextsTab />}
      {tab === "chat" && <ChatTab />}
    </main>
  );
}

/* ── Gallery Tab ─────────────────────────────────────────── */
function GalleryTab() {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<GalleryItem[]>([]);

  const refresh = () =>
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));

  useEffect(() => { refresh(); }, []);

  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setMessage("Uploading…");
    const r = await fetch("/api/admin/gallery", { method: "POST", body: new FormData(form) });
    const d = await r.json();
    setMessage(r.ok ? "Uploaded." : d.error);
    if (r.ok) { form.reset(); refresh(); }
  }

  async function remove(id: number) {
    if (!confirm("Remove this media from the gallery?")) return;
    const r = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    if (r.ok) refresh();
    else setMessage("Could not remove media.");
  }

  return (
    <div className="mt-8">
      <form onSubmit={upload} className="rounded-3xl border border-white/10 bg-white/[.05] p-6">
        <h2 className="mb-4 text-lg font-semibold">Upload media</h2>
        <input required name="file" type="file" accept="image/*,video/*" className="block w-full text-sm text-white/60" />
        <input name="caption" placeholder="A little memory…" className="mt-4 w-full rounded-xl bg-white/10 p-3 text-sm placeholder:text-white/30 outline-none focus:bg-white/[.12]" />
        <button className="mt-4 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--choc)] transition hover:shadow-[0_0_20px_rgba(255,207,122,.25)]">Upload</button>
        {message && <p className="mt-3 text-sm text-white/65">{message}</p>}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="group relative rounded-xl border border-white/10 bg-white/[.04] p-3 transition hover:bg-white/[.07]">
            <p className="truncate text-xs text-white/60">{item.caption || item.resourceType}</p>
            <button
              onClick={() => remove(item.id)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-300/70 transition hover:text-red-300"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-white/30">No gallery items yet.</p>}
      </div>
    </div>
  );
}

/* ── Site Texts Tab ──────────────────────────────────────── */
function TextsTab() {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/texts").then((r) => r.json()).then((d) => setTexts(d.texts ?? {})).catch(() => {});
  }, []);

  async function save(key: string) {
    setSaving(key);
    setError(null);
    setSaved(null);
    try {
      const r = await fetch("/api/admin/texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: texts[key] }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error ?? "Failed to save.");
      }
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(null);
    }
  }

  const textLabels: Record<string, string> = {
    locked_subtitle: "Lock Screen — Subtitle",
    locked_title_birthday: "Lock Screen — Title (Birthday)",
    locked_title_waiting: "Lock Screen — Title (Waiting)",
    locked_description_birthday: "Lock Screen — Description (Birthday)",
    locked_description_waiting: "Lock Screen — Description (Waiting)",
    enter_button: "Lock Screen — Enter Button",
    birthday_date_label: "Birthday — Date Label",
    birthday_title_line1: "Birthday — Title Line 1",
    birthday_title_line2: "Birthday — Title Line 2",
    birthday_subtitle: "Birthday — Subtitle",
    show_message_button: "Birthday — Show Message Button",
    birthday_note_title: "Birthday — Note Title",
    birthday_note_body: "Birthday — Note Body",
    birthday_question: "Entry Gate — Question",
    question_subtitle: "Entry Gate — Subtitle",
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit site content</h2>
        <button
          onClick={() => fetch("/api/texts").then((r) => r.json()).then((d) => setTexts(d.texts ?? {}))}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/[.06] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[.1] hover:text-white/70"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 border border-red-400/20 px-4 py-2 text-sm text-red-300">{error}</p>}

      {Object.entries(texts).map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 transition hover:bg-white/[.06]">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-[.15em] text-[var(--gold)]/70">
              {textLabels[key] ?? key}
            </label>
            {saved === key && (
              <span className="text-xs text-emerald-300/80">Saved ✓</span>
            )}
          </div>
          <textarea
            value={value}
            onChange={(e) => setTexts((prev) => ({ ...prev, [key]: e.target.value }))}
            rows={value.length > 80 ? 3 : 1}
            className="w-full resize-none rounded-xl bg-white/[.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:bg-white/[.1] transition"
          />
          <button
            onClick={() => save(key)}
            disabled={saving === key}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--frosting-deep)]/20 px-3 py-1.5 text-xs font-medium text-[var(--frosting)] transition hover:bg-[var(--frosting-deep)]/30 disabled:opacity-40"
          >
            <Save size={12} />
            {saving === key ? "Saving…" : "Save"}
          </button>
        </div>
      ))}

      {Object.keys(texts).length === 0 && (
        <p className="py-8 text-center text-sm text-white/30">Loading texts…</p>
      )}
    </div>
  );
}

/* ── Chat Tab ────────────────────────────────────────────── */
function ChatTab() {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const refresh = () =>
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});

  useEffect(() => { refresh(); }, []);

  async function remove(id: number) {
    setDeleting(id);
    try {
      const r = await fetch(`/api/chat?id=${id}`, { method: "DELETE" });
      if (r.ok) refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function clearAll() {
    if (!confirm("Delete ALL chat messages? This cannot be undone.")) return;
    setClearing(true);
    try {
      const r = await fetch("/api/chat?all=true", { method: "DELETE" });
      if (r.ok) setMessages([]);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chat messages</h2>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[.06] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[.1] hover:text-white/70"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearAll}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-1.5 text-xs text-red-300/80 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
            >
              <Trash2 size={12} />
              {clearing ? "Clearing…" : "Clear all"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 transition hover:bg-white/[.06]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--gold)]/70">
                  {m.authorName}
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                  m.role === "assistant"
                    ? "bg-[var(--frosting)]/15 text-[var(--frosting)]/70"
                    : "bg-white/10 text-white/40"
                }`}>
                  {m.role}
                </span>
                <span className="text-[10px] text-white/25">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white/70 break-words">{m.content}</p>
            </div>
            <button
              onClick={() => remove(m.id)}
              disabled={deleting === m.id}
              className="shrink-0 rounded-lg p-1.5 text-white/20 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
              aria-label="Delete message"
            >
              {deleting === m.id ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />}
            </button>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-white/30">No chat messages yet.</p>
        )}
      </div>

      <p className="mt-4 text-xs text-white/25">{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
