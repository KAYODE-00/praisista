import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";
import { getDatabaseUrl } from "@/lib/database-url";

const pool = new Pool({ connectionString: getDatabaseUrl() });

const DEFAULT_SECRET_VALUES = new Set([
  "generate-a-long-random-secret",
  "local-development-secret-change-this-before-deploying",
  "change-me",
]);

function getAuthSecret() {
  const configured = process.env.BETTER_AUTH_SECRET?.trim();
  if (configured && !DEFAULT_SECRET_VALUES.has(configured)) {
    return configured;
  }

  return "praisista-local-development-secret-7d8e9f6a4c1b2e3d";
}

function getBaseUrl() {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Ignore invalid values and continue to the next candidate.
    }
  }

  return "http://localhost:3000";
}

const baseURL = getBaseUrl();

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;
      if (!apiKey || !from) throw new Error("Password recovery email is not configured.");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your private birthday room password",
        html: `<p>Use this link to choose a new password:</p><p><a href="${url}">Reset password</a></p><p>This link expires in one hour.</p>`,
      });
    },
  },
  secret: getAuthSecret(),
  baseURL,
  trustedOrigins: Array.from(new Set(["http://localhost:3000", "http://127.0.0.1:3000", baseURL])),
});
