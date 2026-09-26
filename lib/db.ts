import { neon } from "@neondatabase/serverless";

type ChatRole = "user" | "assistant";

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  return neon(databaseUrl);
}

let schemaReady: Promise<void> | undefined;

async function ensureChatSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS birthday_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        session_id UUID NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }

  return schemaReady;
}

export async function saveChatMessage(input: {
  sessionId: string;
  role: ChatRole;
  content: string;
}) {
  await ensureChatSchema();
  const sql = getSql();
  await sql`
    INSERT INTO birthday_chat_messages (session_id, role, content)
    VALUES (${input.sessionId}, ${input.role}, ${input.content})
  `;
}
