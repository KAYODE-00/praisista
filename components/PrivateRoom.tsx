"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import BirthdayChat from "@/components/BirthdayChat";
import BirthdayExperience from "@/components/BirthdayExperience";

const validAnswer = /^(praise|omobolanle|me)$/i;

export default function PrivateRoom() {
  const { data: session, isPending } = authClient.useSession();
  const [signUp, setSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");
    const inviteCode = String(form.get("inviteCode") ?? "");
    setError(null);
    const result = signUp
      ? await authClient.signUp.email({ name, email, password, inviteCode } as never)
      : await authClient.signIn.email({ email, password });
    if (result.error) setError(result.error.message ?? "Unable to sign in.");
  }

  if (isPending) return <main className="grid min-h-screen place-items-center">Loading your private room…</main>;
  if (!session) return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5"><form onSubmit={submit} className="w-full rounded-3xl border border-white/10 bg-white/[.05] p-6"><p className="text-xs uppercase tracking-[.25em] text-[var(--gold)]">Private birthday room</p><h1 className="mt-2 text-3xl font-semibold">{signUp ? "Create access" : "Welcome back"}</h1>{signUp && <><input required name="name" placeholder="Your name" className="mt-6 w-full rounded-xl bg-white/10 p-3" /><input required name="inviteCode" placeholder="Invitation code" className="mt-3 w-full rounded-xl bg-white/10 p-3" /></>}<input required name="email" type="email" placeholder="Email address" className="mt-3 w-full rounded-xl bg-white/10 p-3" /><input required name="password" type="password" minLength={8} placeholder="Password (8+ characters)" className="mt-3 w-full rounded-xl bg-white/10 p-3" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<button className="mt-5 w-full rounded-xl bg-[var(--frosting-deep)] p-3 font-semibold text-[var(--choc)]">{signUp ? "Create account" : "Sign in"}</button>{!signUp && <Link href="/forgot-password" className="mt-3 block text-center text-sm text-white/60">Forgot password?</Link>}<button type="button" onClick={() => setSignUp((value) => !value)} className="mt-4 w-full text-sm text-white/60">{signUp ? "Already have access? Sign in" : "New here? Create an account"}</button></form></main>;
  if (!unlocked) return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5 text-center"><section className="w-full rounded-3xl border border-white/10 bg-white/[.05] p-7"><p className="text-xs uppercase tracking-[.25em] text-[var(--gold)]">One last question</p><h1 className="mt-3 text-3xl font-semibold">Who is the princess born on September 27?</h1><form onSubmit={(event) => { event.preventDefault(); const answer = new FormData(event.currentTarget).get("answer"); if (typeof answer === "string" && validAnswer.test(answer.trim())) { setError(null); setUnlocked(true); } else setError("That answer is not quite right yet."); }}><input name="answer" required placeholder="Your answer" className="mt-6 w-full rounded-xl bg-white/10 p-3" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<button className="mt-4 w-full rounded-xl bg-[var(--gold)] p-3 font-semibold text-[var(--choc)]">Enter our room</button></form></section></main>;
  return <BirthdayExperience />;
}
