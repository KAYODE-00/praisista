import { NextRequest, NextResponse } from "next/server";
import { getBirthdayAIResponse } from "@/lib/ai";
import { saveChatMessage } from "@/lib/db";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (v.role === "user" || v.role === "assistant") && typeof v.content === "string";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { aiName, messages, sessionId } = (body ?? {}) as {
    aiName?: unknown;
    messages?: unknown;
    sessionId?: unknown;
  };

  if (typeof aiName !== "string" || !aiName.trim()) {
    return NextResponse.json({ error: "aiName is required." }, { status: 400 });
  }
  if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
    return NextResponse.json({ error: "messages must be an array of { role, content }." }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return NextResponse.json({ error: "A valid chat session is required." }, { status: 400 });
  }
  // Cap history sent to the model — keeps latency/cost bounded and avoids unbounded payloads.
  const trimmed = (messages as ChatMessage[]).slice(-20);

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured on the server." }, { status: 500 });
  }

  try {
    const reply = await getBirthdayAIResponse({ aiName, messages: trimmed });
    const latestMessage = trimmed.at(-1);
    if (latestMessage?.role === "user") {
      await saveChatMessage({ sessionId, role: "user", content: latestMessage.content });
    }
    await saveChatMessage({ sessionId, role: "assistant", content: reply });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("chat route error:", err);
    return NextResponse.json(
      { error: "Sugar is unavailable right now. Check GROQ_API_KEY and DATABASE_URL, then try again." },
      { status: 502 },
    );
  }
}
