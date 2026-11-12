"use client";
import { ExternalLink, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Badge, Button, EmptyState, KeyValue, type Tone } from "@/components/cms/ui/core";
import { Field, Input, Select, Textarea } from "@/components/cms/ui/form";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";

export type BookingItem = {
  id: string; name: string; email: string; phone: string; company: string; idea: string; stage: string; budget: string; source: string;
  status: string; notes: string; meetLink: string; hasEvent: boolean; when: string; createdAt: string;
};

const TONE: Record<string, Tone> = { pending: "warn", confirmed: "ok", completed: "info", cancelled: "bad", "no-show": "neutral" };
const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no-show"].map((s) => ({ value: s, label: s === "no-show" ? "No-show" : s[0].toUpperCase() + s.slice(1) }));

export default function BookingsTable({ items, empty, tz }: { items: BookingItem[]; empty: string; tz: string }) {
  const [open, setOpen] = useState<BookingItem | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const show = (b: BookingItem) => { setOpen(b); ref.current?.showModal(); };
  const close = () => ref.current?.close();

  if (!items.length) return <EmptyState title={empty}>New bookings from the website appear here.</EmptyState>;
  return (
    <>
      <Table>
        <THead><tr><Th>When ({tz.split("/").pop()?.replace(/_/g, " ")})</Th><Th>Name</Th><Th>Contact</Th><Th>Idea</Th><Th>Stage</Th><Th>Status</Th></tr></THead>
        <TBody>
          {items.map((b) => (
            <Tr key={b.id}>
              <Td className="whitespace-nowrap">{b.when}</Td>
              <Td><button type="button" onClick={() => show(b)} className="font-medium text-accent hover:underline">{b.name}</button>{b.company && <div className="text-xs text-muted">{b.company}</div>}</Td>
              <Td><a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a>{b.phone && <div className="text-xs text-muted">{b.phone}</div>}</Td>
              <Td className="max-w-xs"><span className="line-clamp-2">{b.idea}</span></Td>
              <Td muted className="whitespace-nowrap">{b.stage}</Td>
              <Td><Badge tone={TONE[b.status] ?? "neutral"}>{b.status}</Badge></Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) close(); }} onClose={() => setOpen(null)} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-line bg-surface p-0 shadow-pop open:flex open:flex-col">
        {open && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div><h2 className="text-base font-semibold text-ink">Idea review: {open.name}</h2><p className="mt-0.5 text-[13px] text-muted">{open.when}</p></div>
              <button type="button" aria-label="Close" onClick={close} className="-mr-1 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink"><X className="size-4" /></button>
            </header>
            <div className="overflow-y-auto p-5"><Detail key={open.id} b={open} onDone={close} /></div>
          </>
        )}
      </dialog>
    </>
  );
}

function Detail({ b, onDone }: { b: BookingItem; onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(b.status);
  const [notes, setNotes] = useState(b.notes);
  const [meet, setMeet] = useState(b.meetLink);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await apiFetch(`/api/cms/bookings/${b.id}`, { method: "PATCH", body: { status, notes, meetLink: meet } });
      toast("Saved");
      router.refresh();
      onDone();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <KeyValue items={[
        { label: "Email", value: <a className="text-accent hover:underline" href={`mailto:${b.email}`}>{b.email}</a> },
        { label: "Phone", value: b.phone || "-" },
        { label: "Company", value: b.company || "-" },
        { label: "Stage", value: b.stage },
        { label: "Budget", value: b.budget },
        { label: "Found us", value: b.source || "-" },
        { label: "Booked on", value: b.createdAt },
        { label: "Calendar", value: b.hasEvent ? "Google Calendar event created" : "Not synced to Google Calendar" },
      ]} />
      <div>
        <div className="mb-1 text-[13px] font-medium text-ink-2">Their idea</div>
        <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2 p-3 text-[13px] text-ink">{b.idea}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" hint={status === "cancelled" && b.status !== "cancelled" ? "Cancelling also removes the Google Calendar event." : undefined}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUSES} />
        </Field>
        <Field label="Meeting link" hint="Filled in automatically when Google Calendar is connected.">
          <Input value={meet} onChange={(e) => setMeet(e.target.value)} placeholder="https://meet.google.com/…" />
        </Field>
      </div>
      {meet && <a href={meet} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-accent hover:underline"><Video className="size-4" aria-hidden />Open meeting<ExternalLink className="size-3" aria-hidden /></a>}
      <Field label="Internal notes" hint="Only your team sees these."><Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="button" variant="ghost" onClick={onDone}>Close</Button>
        <Button type="button" variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
