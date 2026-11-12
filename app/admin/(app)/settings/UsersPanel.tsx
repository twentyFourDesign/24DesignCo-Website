"use client";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { ROLE_INFO, type Role } from "@/lib/cms/roles";
import { Badge, Button, Callout, Card, type Tone } from "@/components/cms/ui/core";
import { Field, FormGrid, Input, Select } from "@/components/cms/ui/form";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";

export type UserItem = { id: string; name: string; email: string; role: string; status: string; lastLoginAt: string };
const STATUS_TONE: Record<string, Tone> = { active: "ok", invited: "warn", disabled: "neutral" };
const label = (r: string) => r[0].toUpperCase() + r.slice(1);

export default function UsersPanel({ users, meId, meRole }: { users: UserItem[]; meId: string; meRole: string }) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ email: string; url: string } | null>(null);
  const isOwner = meRole === "owner";
  const assignable: Role[] = isOwner ? ["owner", "admin", "editor", "author"] : ["editor", "author"];
  const manageable = (u: UserItem) => u.id !== meId && (isOwner || u.role === "editor" || u.role === "author");

  async function run(fn: () => Promise<void>, ok?: string) {
    setBusy(true);
    try { await fn(); if (ok) toast(ok); router.refresh(); } catch (e) { toast((e as Error).message, "bad"); } finally { setBusy(false); }
  }
  const invite = (e: React.FormEvent) => { e.preventDefault(); void run(async () => {
    const r = await apiFetch<{ inviteUrl: string }>("/api/cms/users", { method: "POST", body: { email, name, role } });
    setLink({ email, url: r.inviteUrl }); setEmail(""); setName("");
  }, "Invite created. Copy the link below and send it."); };
  const patch = (u: UserItem, body: object, ok: string) => run(async () => { await apiFetch(`/api/cms/users/${u.id}`, { method: "PATCH", body }); }, ok);
  const resend = (u: UserItem) => run(async () => { const r = await apiFetch<{ inviteUrl: string }>(`/api/cms/users/${u.id}/resend-invite`, { method: "POST" }); setLink({ email: u.email, url: r.inviteUrl }); }, "New invite link created.");
  const remove = (u: UserItem) => { if (confirm(`Remove ${u.email}? They will no longer be able to sign in.`)) void run(async () => { await apiFetch(`/api/cms/users/${u.id}`, { method: "DELETE" }); }, "Removed."); };
  const copy = async () => { try { await navigator.clipboard.writeText(link!.url); toast("Link copied"); } catch { toast("Could not copy. Select the link and copy it.", "bad"); } };

  return (
    <div className="space-y-6">
      {link && (
        <Callout tone="ok" title={`Invite link for ${link.email}`}>
          <p>This is shown only once and expires in 7 days. Send it to them yourself.</p>
          <div className="mt-2 flex gap-2"><Input readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} /><Button type="button" onClick={copy}><Copy className="size-4" aria-hidden />Copy</Button></div>
        </Callout>
      )}
      <Card title="Invite someone" description="They get a one-time link to set their name and password.">
        <form onSubmit={invite} className="space-y-4">
          <FormGrid cols={3}>
            <Field label="Email" required><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Name (optional)"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Role"><Select value={role} onChange={(e) => setRole(e.target.value as Role)} options={assignable.map((r) => ({ value: r, label: label(r) }))} /></Field>
          </FormGrid>
          <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy}>Create invite</Button></div>
        </form>
      </Card>
      <Card title="People" flush>
        <Table>
          <THead><tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th>Last sign-in</Th><Th align="right">Actions</Th></tr></THead>
          <TBody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td><div className="font-medium">{u.name || "(no name yet)"}{u.id === meId && <span className="ml-1.5 text-xs text-muted">you</span>}</div><div className="text-xs text-muted">{u.email}</div></Td>
                <Td>{manageable(u) ? <Select aria-label={`Role for ${u.email}`} value={u.role} disabled={busy} onChange={(e) => patch(u, { role: e.target.value }, "Role changed.")} className="h-8 w-28" options={(assignable.includes(u.role as Role) ? assignable : [u.role as Role, ...assignable]).map((r) => ({ value: r, label: label(r) }))} /> : label(u.role)}</Td>
                <Td><Badge tone={STATUS_TONE[u.status] ?? "neutral"}>{u.status}</Badge></Td>
                <Td muted>{u.lastLoginAt || "-"}</Td>
                <Td align="right">
                  {manageable(u) && (
                    <div className="flex justify-end gap-1.5">
                      {u.status === "invited" && <Button size="sm" type="button" disabled={busy} onClick={() => resend(u)}>Resend invite</Button>}
                      {u.status === "active" && <Button size="sm" type="button" disabled={busy} onClick={() => patch(u, { status: "disabled" }, "Disabled.")}>Disable</Button>}
                      {u.status === "disabled" && <Button size="sm" type="button" disabled={busy} onClick={() => patch(u, { status: "active" }, "Enabled.")}>Enable</Button>}
                      <Button size="sm" variant="danger" type="button" disabled={busy} onClick={() => remove(u)}>Remove</Button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
      <Card title="What each role can do">
        <dl className="grid gap-2 text-[13px] sm:grid-cols-[6rem_1fr]">
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => <div key={r} className="contents"><dt className="font-medium text-ink">{label(r)}</dt><dd className="text-muted">{ROLE_INFO[r]}</dd></div>)}
        </dl>
      </Card>
    </div>
  );
}
