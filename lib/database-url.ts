export function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not configured.");

  const decoded = raw.includes("%3A") ? decodeURIComponent(raw) : raw;
  let url: URL;
  try {
    url = new URL(decoded);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must begin with postgresql://.");
  }

  const sslmode = url.searchParams.get("sslmode") ?? "require";
  const channelBinding = url.searchParams.get("channel_binding");
  url.search = "";
  url.searchParams.set("sslmode", sslmode);
  if (channelBinding) url.searchParams.set("channel_binding", channelBinding);
  return url.toString();
}
