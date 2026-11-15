"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Input } from "@/components/cms/ui/form";
import { Button } from "@/components/cms/ui/core";
import { Callout } from "@/components/cms/ui/core";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/cms/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not sign in"); return; }
      router.replace("/admin"); router.refresh();
    } catch { setError("Could not reach the server. Please try again."); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      {error && <Callout tone="bad">{error}</Callout>}
      <Field label="Email"><Input name="email" type="email" autoComplete="email" required autoFocus /></Field>
      <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
      <Button type="submit" variant="primary" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
