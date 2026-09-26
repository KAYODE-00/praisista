import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { getDatabaseUrl } from "@/lib/database-url";

const pool = new Pool({ connectionString: getDatabaseUrl() });

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
});
