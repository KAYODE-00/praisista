import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";
import { getDatabaseUrl } from "@/lib/database-url";

const pool = new Pool({ connectionString: getDatabaseUrl() });
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

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
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: ["http://localhost:3000", baseURL],
});
