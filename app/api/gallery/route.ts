import { NextResponse } from "next/server";
import { listGalleryItems } from "@/lib/gallery";
export async function GET() { return NextResponse.json({ items: await listGalleryItems() }); }
