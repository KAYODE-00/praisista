import { Suspense } from "react";
import PasswordRecovery from "@/components/PasswordRecovery";

export default function ForgotPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center">Loading…</main>}><PasswordRecovery /></Suspense>;
}
