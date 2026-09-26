import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminDashboard from "@/components/AdminDashboard";
export default async function AdminPage() { if (!await requireAdmin(await headers())) redirect("/room"); return <AdminDashboard />; }
