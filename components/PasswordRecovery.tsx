"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function PasswordRecovery() {
  const token = useSearchParams().get("token");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    if (token) {
      const newPassword = String(form.get("password") ?? "");
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) setError(result.error.message ?? "Unable to reset password.");
      else setNotice("Password updated. You can now sign in.");
      return;
    }
    const email = String(form.get("email") ?? "");
    const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/forgot-password` });
    if (result.error) setError(result.error.message ?? "Unable to send reset email.");
    else setNotice("If an account matches that email, a reset link is on its way.");
  }

  return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5"><form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-white/[.05] p-6"><p className="text-xs uppercase tracking-[.25em] text-[var(--gold)]">Private birthday room</p><h1 className="mt-2 text-3xl font-semibold">{token ? "Choose a new password" : "Recover your password"}</h1><p className="mt-3 text-sm text-white/60">{token ? "Use a new password with at least eight characters." : "Enter your account email and we’ll send a secure reset link."}</p><input required name={token ? "password" : "email"} type={token ? "password" : "email"} minLength={token ? 8 : undefined} placeholder={token ? "New password" : "Email address"} className="mt-6 w-full rounded-xl bg-white/10 p-3" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}{notice && <p className="mt-3 text-sm text-emerald-200">{notice}</p>}<button className="mt-5 w-full rounded-xl bg-[var(--frosting-deep)] p-3 font-semibold text-[var(--choc)]">{token ? "Save new password" : "Send reset link"}</button><Link href="/room" className="mt-4 block text-center text-sm text-white/60">Back to sign in</Link></form></main>;
}
