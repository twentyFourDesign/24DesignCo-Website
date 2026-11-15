"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Field, Input } from "@/components/cms/ui/form";
import { Button, Callout } from "@/components/cms/ui/core";

export default function AcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<{ email: string; name: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/cms/auth/invite?token=${encodeURIComponent(token)}`).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (r.ok) setInvite(d); else setError(d.error || "This invite link is invalid or has expired");
    }).catch(() => setError("Could not reach the server"));
  }, [token]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) { setError("The two passwords do not match"); return; }
    setBusy(true); setError("");
    const res = await fetch("/api/cms/auth/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, name: f.get("name"), password: f.get("password") }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error || "Something went wrong"); return; }
    router.replace("/admin"); router.refresh();
  }

  if (!invite) return <div className="mt-4">{error ? <Callout tone="bad">{error}</Callout> : <p className="text-[13px] text-muted">Checking your invite…</p>}</div>;
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <p className="text-[13px] text-muted">You were invited as <strong className="text-ink">{invite.role}</strong> with {invite.email}. Choose a name and password to finish.</p>
      {error && <Callout tone="bad">{error}</Callout>}
      <Field label="Your name"><Input name="name" defaultValue={invite.name} required /></Field>
      <Field label="Password" hint="At least 10 characters."><Input name="password" type="password" minLength={10} autoComplete="new-password" required /></Field>
      <Field label="Confirm password"><Input name="confirm" type="password" minLength={10} autoComplete="new-password" required /></Field>
      <Button type="submit" variant="primary" className="w-full" disabled={busy}>{busy ? "Saving…" : "Create my account"}</Button>
    </form>
  );
}
