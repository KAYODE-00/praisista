import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req.headers);
  return NextResponse.json({ isAdmin: !!session });
}
