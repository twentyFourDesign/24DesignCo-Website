"use client";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState } from "@/components/cms/ui/core";
import { Avatar } from "@/components/cms/ui/brand";
import { buttonClass } from "@/components/cms/ui/button-style";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";

export type TeamRow = { id: string; name: string; role: string; shortBio: string; photo: string; isFounder: boolean; visible: boolean };

export default function TeamList({ initial }: { initial: TeamRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function move(i: number, d: -1 | 1) {
    const next = [...rows]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    try { await apiFetch("/api/cms/team/reorder", { method: "POST", body: { ids: next.map((r) => r.id) } }); } catch (e) { toast((e as Error).message, "bad"); setRows(rows); }
  }
  async function toggle(r: TeamRow) {
    try { await apiFetch(`/api/cms/team/${r.id}`, { method: "PATCH", body: { visible: !r.visible } }); setRows((l) => l.map((x) => (x.id === r.id ? { ...x, visible: !r.visible } : x))); } catch (e) { toast((e as Error).message, "bad"); }
  }
  async function add() {
    setBusy(true);
    try { const { id } = await apiFetch<{ id: string }>("/api/cms/team", { method: "POST", body: {} }); router.push(`/admin/team/${id}`); } catch (e) { toast((e as Error).message, "bad"); setBusy(false); }
  }

  return (
    <Card flush title={`${rows.length} ${rows.length === 1 ? "person" : "people"}`} actions={<button type="button" onClick={add} disabled={busy} className={buttonClass("primary", "md")}><Plus className="size-4" /> Add person</button>}>
      {rows.length === 0 ? <EmptyState title="No team members yet">Add the first person to show on the website.</EmptyState> : (
        <ul className="divide-y divide-line">
          {rows.map((r, i) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <div className="flex flex-col">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-30"><ArrowDown className="size-4" /></button>
              </div>
              {r.photo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.photo} alt="" className="size-12 rounded-full object-cover ring-1 ring-line" />
                : <Avatar name={r.name || "?"} size={48} />}
              <div className="min-w-0 flex-1">
                <Link href={`/admin/team/${r.id}`} className="font-semibold text-ink hover:text-accent">{r.name || "Unnamed"}</Link>
                <div className="truncate text-[13px] text-muted">{r.role || "No role yet"}</div>
              </div>
              {r.isFounder && <Badge tone="accent" dot={false}>Founder</Badge>}
              <Button type="button" size="sm" variant={r.visible ? "secondary" : "ghost"} onClick={() => toggle(r)}>{r.visible ? "Shown on website" : "Hidden"}</Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
