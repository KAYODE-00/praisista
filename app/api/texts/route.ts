import { NextResponse } from "next/server";
import { getTexts } from "@/lib/site-texts";

export async function GET() {
  return NextResponse.json({ texts: await getTexts() });
}
