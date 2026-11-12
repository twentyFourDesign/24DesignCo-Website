"use client";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, StatusBadge } from "@/components/cms/ui/core";
import { Field, Input, Select } from "@/components/cms/ui/form";
import { Modal } from "@/components/cms/ui/modal";
import { buttonClass } from "@/components/cms/ui/button-style";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";

export type WorkRow = { id: string; slug: string; name: string; type: string; tag: string; summary: string; coverImage: string; logo: string; featured: boolean; status: string };

export default function WorkList({ initial }: { initial: WorkRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function move(i: number, d: -1 | 1) {
    const next = [...rows]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    try { await apiFetch("/api/cms/work/reorder", { method: "POST", body: { ids: next.map((r) => r.id) } }); } catch (e) { toast((e as Error).message, "bad"); setRows(rows); }
  }
  async function patch(r: WorkRow, body: Record<string, unknown>) {
    try { await apiFetch(`/api/cms/work/${r.id}`, { method: "PATCH", body }); setRows((l) => l.map((x) => (x.id === r.id ? { ...x, ...body } as WorkRow : x))); } catch (e) { toast((e as Error).message, "bad"); }
  }
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const { id } = await apiFetch<{ id: string }>("/api/cms/work", { method: "POST", body: { name: f.get("name"), type: f.get("type") } });
      router.push(`/admin/work/${id}`);
    } catch (err) { toast((err as Error).message, "bad"); setBusy(false); }
  }

  return (
    <Card flush title={`${rows.length} project${rows.length === 1 ? "" : "s"}`} actions={
      <Modal trigger={<><Plus className="size-4" /> Add project</>} triggerClass={buttonClass("primary", "md")} title="Add a project" description="You can fill in the details on the next screen. It stays a draft until you publish it.">
        <form onSubmit={create} className="space-y-4">
          <Field label="Project name" required><Input name="name" required autoFocus /></Field>
          <Field label="Type"><Select name="type" options={[{ value: "case-study", label: "Case study (startup, idea to launch)" }, { value: "partnership", label: "Ongoing partnership" }]} /></Field>
          <div className="flex justify-end"><Button type="submit" variant="primary" disabled={busy}>{busy ? "Adding…" : "Add and continue"}</Button></div>
        </form>
      </Modal>
    }>
      {rows.length === 0 ? <EmptyState title="No projects yet">Add your first case study or partnership.</EmptyState> : (
        <ul className="divide-y divide-line">
          {rows.map((r, i) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <div className="flex flex-col">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowDown className="size-4" /></button>
              </div>
              <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(r.coverImage || r.logo) ? <img src={r.coverImage || r.logo} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-faint">No image</span>}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/work/${r.id}`} className="font-semibold text-ink hover:text-accent">{r.name}</Link>
                <div className="mt-0.5 truncate text-[13px] text-muted">{r.tag || r.summary || "No description yet"}</div>
              </div>
              <Badge tone={r.type === "partnership" ? "info" : "neutral"} dot={false}>{r.type === "partnership" ? "Partnership" : "Case study"}</Badge>
              <StatusBadge status={r.status} />
              <button type="button" onClick={() => patch(r, { featured: !r.featured })} aria-pressed={r.featured} title={r.featured ? "Shown on the home page" : "Not on the home page"} className={`rounded-lg p-2 hover:bg-surface-2 ${r.featured ? "text-warn" : "text-faint"}`}><Star className={`size-4 ${r.featured ? "fill-current" : ""}`} /></button>
              <Link href={`/our-work/${r.slug}`} target="_blank" aria-label="View on the website" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"><ExternalLink className="size-4" /></Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
