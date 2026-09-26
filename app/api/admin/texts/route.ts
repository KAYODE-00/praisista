import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { updateText, DEFAULT_TEXTS } from "@/lib/site-texts";

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin(req.headers);
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof value !== 'string' || !(key in DEFAULT_TEXTS)) {
      return NextResponse.json({ error: "Bad Request: invalid key or missing value" }, { status: 400 });
    }

    await updateText(key, value);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
