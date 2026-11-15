"use client";
import { Mail, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Badge, Button, EmptyState, KeyValue, type Tone } from "@/components/cms/ui/core";
import { Field, Select, Textarea } from "@/components/cms/ui/form";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";

export type MessageItem = {
  id: string; name: string; email: string; whatsapp: string; message: string; stage: string; page: string;
  status: string; notes: string; received: string;
};

const TONE: Record<string, Tone> = { new: "warn", read: "neutral", replied: "ok", archived: "info" };
const STATUSES = [
  { value: "new", label: "New" }, { value: "read", label: "Read" }, { value: "replied", label: "Replied" }, { value: "archived", label: "Archived" },
];
const waLink = (n: string) => `https://wa.me/${n.replace(/[^\d]/g, "").replace(/^0/, "234")}`;

export default function MessagesTable({ items, empty }: { items: MessageItem[]; empty: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<MessageItem | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();
  const show = (m: MessageItem) => {
    setOpen(m);
    ref.current?.showModal();
    // Opening a new message marks it read.
    if (m.status === "new") apiFetch(`/api/cms/messages/${m.id}`, { method: "PATCH", body: { status: "read" } }).then(() => router.refresh()).catch(() => {});
  };

  if (!items.length) return <EmptyState title={empty}>Messages from the contact form on the website appear here.</EmptyState>;
  return (
    <>
      <Table>
        <THead><tr><Th>Received</Th><Th>From</Th><Th>Message</Th><Th>Stage</Th><Th>Status</Th></tr></THead>
        <TBody>
          {items.map((m) => (
            <Tr key={m.id}>
              <Td className="whitespace-nowrap">{m.received}</Td>
              <Td>
                <button type="button" onClick={() => show(m)} className={`text-left text-accent hover:underline ${m.status === "new" ? "font-semibold" : "font-medium"}`}>{m.name}</button>
                <div className="text-xs text-muted">{m.email}</div>
              </Td>
              <Td className="max-w-md"><span className={`line-clamp-2 ${m.status === "new" ? "text-ink" : ""}`}>{m.message}</span></Td>
              <Td muted className="whitespace-nowrap">{m.stage || "-"}</Td>
              <Td><Badge tone={TONE[m.status] ?? "neutral"}>{m.status}</Badge></Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) close(); }} onClose={() => setOpen(null)} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-line bg-surface p-0 shadow-pop open:flex open:flex-col">
        {open && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div><h2 className="text-base font-semibold text-ink">Message from {open.name}</h2><p className="mt-0.5 text-[13px] text-muted">{open.received}</p></div>
              <button type="button" aria-label="Close" onClick={close} className="-mr-1 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink"><X className="size-4" /></button>
            </header>
            <div className="overflow-y-auto p-5"><Detail key={open.id} m={open} onDone={close} /></div>
          </>
        )}
      </dialog>
    </>
  );
}

function Detail({ m, onDone }: { m: MessageItem; onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(m.status === "new" ? "read" : m.status);
  const [notes, setNotes] = useState(m.notes);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const subject = encodeURIComponent("Your message to 24 Design Co.");

  async function save() {
    setBusy(true);
    try {
      await apiFetch(`/api/cms/messages/${m.id}`, { method: "PATCH", body: { status, notes } });
      toast("Saved");
      router.refresh();
      onDone();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await apiFetch(`/api/cms/messages/${m.id}`, { method: "DELETE" });
      toast("Message deleted");
      router.refresh();
      onDone();
    } catch (e) {
      toast((e as Error).message, "bad");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <KeyValue items={[
        { label: "Email", value: <a className="text-accent hover:underline" href={`mailto:${m.email}`}>{m.email}</a> },
        { label: "WhatsApp", value: m.whatsapp ? <a className="text-accent hover:underline" href={waLink(m.whatsapp)} target="_blank" rel="noreferrer">{m.whatsapp}</a> : "-" },
        { label: "Stage", value: m.stage || "-" },
        { label: "Sent from", value: m.page || "-" },
      ]} />
      <div>
        <div className="mb-1 text-[13px] font-medium text-ink-2">What they are building</div>
        <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2 p-3 text-[13px] text-ink">{m.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${m.email}?subject=${subject}`} onClick={() => setStatus("replied")} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-2"><Mail className="size-4" aria-hidden />Reply by email</a>
        {m.whatsapp && <a href={waLink(m.whatsapp)} target="_blank" rel="noreferrer" onClick={() => setStatus("replied")} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-2"><MessageCircle className="size-4" aria-hidden />Reply on WhatsApp</a>}
      </div>
      <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUSES} /></Field>
      <Field label="Internal notes" hint="Only your team sees these."><Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        {confirm ? (
          <span className="flex items-center gap-2 text-[13px]">Delete for good?
            <Button type="button" variant="danger" size="sm" disabled={busy} onClick={remove}>Yes, delete</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
          </span>
        ) : <Button type="button" variant="ghost" onClick={() => setConfirm(true)}>Delete</Button>}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>Close</Button>
          <Button type="button" variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Button>
        </div>
      </div>
    </div>
  );
}
