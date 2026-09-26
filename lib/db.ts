import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/lib/database-url";

export type GroupMessage = {
  id: number;
  authorName: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function getSql() {
  return neon(getDatabaseUrl());
}

let schemaReady: Promise<void> | undefined;

async function ensureChatSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS birthday_group_messages (
        id BIGSERIAL PRIMARY KEY,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }
  return schemaReady;
}

export async function listGroupMessages() {
  await ensureChatSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, author_name, role, content, created_at
    FROM birthday_group_messages
    ORDER BY id DESC
    LIMIT 100
  `;
  return rows.reverse().map((row) => ({
    id: Number(row.id), authorName: String(row.author_name), role: row.role === "assistant" ? "assistant" : "user", content: String(row.content), createdAt: new Date(String(row.created_at)).toISOString(),
  })) as GroupMessage[];
}

export async function saveGroupMessage(input: { authorId: string; authorName: string; role: "user" | "assistant"; content: string }) {
  await ensureChatSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO birthday_group_messages (author_id, author_name, role, content)
    VALUES (${input.authorId}, ${input.authorName}, ${input.role}, ${input.content})
    RETURNING id, author_name, role, content, created_at
  `;
  const row = rows[0];
  return { id: Number(row.id), authorName: String(row.author_name), role: row.role === "assistant" ? "assistant" : "user", content: String(row.content), createdAt: new Date(String(row.created_at)).toISOString() } as GroupMessage;
}

export async function deleteGroupMessage(id: number): Promise<boolean> {
  await ensureChatSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM birthday_group_messages WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteAllGroupMessages(): Promise<void> {
  await ensureChatSchema();
  const sql = getSql();
  await sql`
    DELETE FROM birthday_group_messages
  `;
}
