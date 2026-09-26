import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/lib/database-url";

export const DEFAULT_TEXTS: Record<string, string> = {
  locked_subtitle: "A birthday moment, waiting",
  locked_title_birthday: "It's finally time.",
  locked_title_waiting: "Not quite yet…",
  locked_description_birthday: "Someone has been waiting to show you something.",
  locked_description_waiting: "Come back when the clock reaches September 27. Something made especially for you will be waiting.",
  enter_button: "Enter your birthday space",
  birthday_date_label: "September 27 ✨",
  birthday_title_line1: "Happy Birthday",
  birthday_title_line2: "beautiful.",
  birthday_subtitle: "I made this little corner of the internet just for you. There are a few things waiting for you inside.",
  show_message_button: "There's something I want you to see",
  birthday_note_title: "A little note",
  birthday_note_body: "I hope today gives you plenty of reasons to smile. You deserve a beautiful day, beautiful memories, and people who genuinely appreciate having you around. ❤️",
  birthday_question: "Who is the princess born on September 27?",
  question_subtitle: "A birthday question"
};

let schemaReady: Promise<void> | undefined;

async function ensureSchema() {
  if (!schemaReady) {
    const sql = neon(getDatabaseUrl());
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS site_texts (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }
  return schemaReady;
}

export async function getTexts(): Promise<Record<string, string>> {
  await ensureSchema();
  const sql = neon(getDatabaseUrl());
  const rows = await sql`SELECT key, value FROM site_texts`;
  const merged = { ...DEFAULT_TEXTS };
  for (const row of rows) {
    if (row.key in merged) {
      merged[row.key] = String(row.value);
    }
  }
  return merged;
}

export async function updateText(key: string, value: string): Promise<void> {
  await ensureSchema();
  const sql = neon(getDatabaseUrl());
  await sql`
    INSERT INTO site_texts (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `;
}
