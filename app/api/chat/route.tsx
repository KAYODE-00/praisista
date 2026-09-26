import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBirthdayAIResponse } from "@/lib/ai";
import { listGroupMessages, saveGroupMessage, deleteGroupMessage, deleteAllGroupMessages } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

async function getViewer(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

export async function GET(req: NextRequest) {
  const session = await getViewer(req);
  if (!session) return NextResponse.json({ error: "Sign in to view this chat." }, { status: 401 });
  return NextResponse.json({ messages: await listGroupMessages() });
}

export async function POST(req: NextRequest) {
  const session = await getViewer(req);
  if (!session) return NextResponse.json({ error: "Sign in to send a message." }, { status: 401 });
  const body = await req.json().catch(() => null) as { content?: unknown; aiEnabled?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content : "";
  if (!content.trim()) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });

  const message = await saveGroupMessage({ authorId: session.user.id, authorName: session.user.name || "Guest", role: "user", content });
  let aiMessage = null;
  if (body?.aiEnabled === true && process.env.GROQ_API_KEY) {
    const history = (await listGroupMessages()).slice(-20).map((item) => ({ role: item.role, content: `${item.authorName}: ${item.content}` }));
    const birthdayGirl = process.env.BIRTHDAY_GIRL_EMAIL?.toLowerCase() === session.user.email.toLowerCase();
    const reply = await getBirthdayAIResponse({
      aiName: "A little birthday magic",
      messages: [{ role: "assistant", content: birthdayGirl ? "The birthday girl just spoke. Give her a warm, natural birthday wish before responding." : "" }, ...history],
    });
    aiMessage = await saveGroupMessage({ authorId: "birthday-magic", authorName: "A little magic", role: "assistant", content: reply });
  }
  return NextResponse.json({ message, aiMessage });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req.headers)) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const url = new URL(req.url);
  if (url.searchParams.get("all") === "true") {
    await deleteAllGroupMessages();
    return NextResponse.json({ ok: true });
  }
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid message ID." }, { status: 400 });
  const deleted = await deleteGroupMessage(id);
  if (!deleted) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
