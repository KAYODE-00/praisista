import { auth } from "@/lib/auth";
export async function requireAdmin(headers: Headers) { const session = await auth.api.getSession({ headers }); return session && process.env.ADMIN_EMAIL && session.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() ? session : null; }
