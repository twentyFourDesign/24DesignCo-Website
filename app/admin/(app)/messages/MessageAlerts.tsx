"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Button, Callout } from "@/components/cms/ui/core";
import { Input } from "@/components/cms/ui/form";

/** Where new messages are emailed. Admins can change it; editors see it. */
export default function MessageAlerts({ alertEmail, emailConfigured, canEdit }: { alertEmail: string; emailConfigured: boolean; canEdit: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState(alertEmail);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/cms/messages/settings", { method: "PUT", body: { alertEmail: email } });
      toast(email ? `New messages will be emailed to ${email}` : "Message emails turned off");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {!emailConfigured && (
        <Callout tone="warn" title="Email is not set up yet">
          Messages are saved here, but none are emailed until your developer adds SMTP_URL (and MAIL_FROM) to the server settings in Vercel.
        </Callout>
      )}
      <form onSubmit={save} className="flex flex-wrap items-end gap-2 rounded-xl border border-line bg-surface p-4">
        <label className="min-w-0 flex-1 text-[13px] font-medium text-ink-2">
          Email new messages to
          <Input type="email" value={email} disabled={!canEdit} onChange={(e) => setEmail(e.target.value)} placeholder="you@24group.com.ng" className="mt-1 w-full" />
        </label>
        {canEdit ? <Button type="submit" variant="secondary" disabled={busy || email === alertEmail}>{busy ? "Saving…" : "Save"}</Button> : <span className="text-[12px] text-muted">Only admins can change this.</span>}
      </form>
    </div>
  );
}
