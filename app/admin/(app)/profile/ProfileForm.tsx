"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Button, Card } from "@/components/cms/ui/core";
import { Field, FormGrid, Input } from "@/components/cms/ui/form";

export default function ProfileForm({ name: initial }: { name: string }) {
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState("");

  async function saveName(e: React.FormEvent) {
    e.preventDefault(); setBusy("name");
    try { await apiFetch("/api/cms/auth/me", { method: "PATCH", body: { name } }); toast("Name saved."); router.refresh(); }
    catch (err) { toast((err as Error).message, "bad"); } finally { setBusy(""); }
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== again) return toast("The new passwords do not match.", "bad");
    setBusy("pw");
    try { await apiFetch("/api/cms/auth/me", { method: "PATCH", body: { currentPassword: cur, newPassword: next } }); toast("Password changed."); setCur(""); setNext(""); setAgain(""); }
    catch (err) { toast((err as Error).message, "bad"); } finally { setBusy(""); }
  }
  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Your name">
        <form onSubmit={saveName} className="space-y-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></Field>
          <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy === "name"}>Save name</Button></div>
        </form>
      </Card>
      <Card title="Change password" description="Use at least 10 characters.">
        <form onSubmit={savePassword} className="space-y-4">
          <Field label="Current password"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" /></Field>
          <FormGrid>
            <Field label="New password"><Input type="password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" /></Field>
            <Field label="Repeat new password"><Input type="password" minLength={10} value={again} onChange={(e) => setAgain(e.target.value)} required autoComplete="new-password" /></Field>
          </FormGrid>
          <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy === "pw"}>Change password</Button></div>
        </form>
      </Card>
    </div>
  );
}
