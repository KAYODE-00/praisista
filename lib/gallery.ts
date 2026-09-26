import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/lib/database-url";

export type GalleryItem = { id: number; url: string; resourceType: "image" | "video"; caption: string | null };
let ready: Promise<void> | undefined;
async function schema() { if (!ready) { const sql = neon(getDatabaseUrl()); ready = sql`CREATE TABLE IF NOT EXISTS birthday_gallery_items (id BIGSERIAL PRIMARY KEY, url TEXT NOT NULL, resource_type TEXT NOT NULL, caption TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`.then(() => undefined); } return ready; }
export async function listGalleryItems() { await schema(); const rows = await neon(getDatabaseUrl())`SELECT id,url,resource_type,caption FROM birthday_gallery_items ORDER BY id DESC`; return rows.map((r) => ({ id: Number(r.id), url: String(r.url), resourceType: r.resource_type === "video" ? "video" : "image", caption: r.caption ? String(r.caption) : null })) as GalleryItem[]; }
export async function addGalleryItem(item: Omit<GalleryItem, "id">) { await schema(); await neon(getDatabaseUrl())`INSERT INTO birthday_gallery_items (url,resource_type,caption) VALUES (${item.url},${item.resourceType},${item.caption})`; }
export async function deleteGalleryItem(id: number) { await schema(); await neon(getDatabaseUrl())`DELETE FROM birthday_gallery_items WHERE id = ${id}`; }
