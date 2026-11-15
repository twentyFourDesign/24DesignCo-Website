"use client";
import { Copy, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Callout, Card, cn } from "@/components/cms/ui/core";
import { Field, Input, Select } from "@/components/cms/ui/form";
import { buttonClass } from "@/components/cms/ui/button-style";
import { useToast } from "@/components/cms/Toast";
import { apiFetch } from "@/lib/cms/client";
import { uploadFiles } from "@/lib/cms/upload";
import { FOLDERS, fmtBytes, type MediaItem, type MediaUsage } from "@/lib/cms/blog-shared";

type List = { files: MediaItem[]; counts: Record<string, number>; total: number };
const isImg = (m: MediaItem) => m.mimeType.startsWith("image/");

export default function MediaLibrary({ initial }: { initial: List }) {
  const toast = useToast();
  const [data, setData] = useState<List>(initial);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const first = useRef(true);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (folder) p.set("folder", folder);
    if (q.trim()) p.set("q", q.trim());
    try { setData(await apiFetch<List>(`/api/cms/media?${p}`)); } catch (e) { toast((e as Error).message, "bad"); }
  }, [folder, q, toast]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function upload(list: FileList | File[]) {
    const arr = Array.from(list);
    if (!arr.length) return;
    setBusy(true);
    const r = await uploadFiles(arr, folder || "Other");
    r.errors.forEach((m) => toast(m, "bad"));
    if (r.files.length) {
      toast(`${r.files.length} file${r.files.length > 1 ? "s" : ""} uploaded`);
      await load();
      if (r.files.length === 1) setSel(r.files[0]);
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_340px]">
      <nav aria-label="Folders" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {[{ name: "", label: "All files", n: data.total }, ...FOLDERS.map((f) => ({ name: f as string, label: f as string, n: data.counts[f] ?? 0 }))].map((f) => (
          <button key={f.name} type="button" onClick={() => setFolder(f.name)} aria-current={folder === f.name}
            className={cn("flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap", folder === f.name ? "bg-accent-soft font-medium text-accent" : "text-ink-2 hover:bg-surface-2")}>
            {f.label}<span className="tnum text-xs text-muted">{f.n}</span>
          </button>
        ))}
      </nav>

      <div className="min-w-0 space-y-4" onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}>
        <div className="flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text" aria-label="Search files" className="w-64" />
          <input ref={input} type="file" multiple hidden accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf" onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className={cn(buttonClass("primary", "md"), "ml-auto")}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Upload{folder ? ` to ${folder}` : ""}
          </button>
        </div>
        <div className={cn("rounded-xl border-2 border-dashed p-4 text-center text-[13px] transition-colors", drag ? "border-accent bg-accent-soft text-accent" : "border-line text-muted")}>
          Drag files here to upload{folder ? ` to ${folder}` : ""}, or use the Upload button.
        </div>
        {data.files.length === 0 ? (
          <Card><p className="py-8 text-center text-sm text-muted">{q ? "No files match your search." : "No files in this folder yet."}</p></Card>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {data.files.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => setSel(f)} className={cn("block w-full overflow-hidden rounded-xl border bg-surface text-left shadow-card transition-colors hover:border-accent/60", sel?.id === f.id ? "border-accent ring-2 ring-accent/20" : "border-line")}>
                  <span className="flex aspect-square items-center justify-center bg-surface-2">
                    {isImg(f) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.alt} loading="lazy" className="size-full object-contain" />
                    ) : <FileText className="size-8 text-muted" aria-hidden />}
                  </span>
                  <span className="block px-3 py-2">
                    <span className="block truncate text-[13px] font-medium text-ink">{f.originalName}</span>
                    <span className="flex items-center justify-between text-xs text-muted"><span>{fmtBytes(f.size)}</span>{isImg(f) && !f.alt && <span className="text-warn">No alt text</span>}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sel && <FilePanel key={sel.id} file={sel} onClose={() => setSel(null)} onChanged={async (f) => { if (f) setSel(f); else setSel(null); await load(); }} />}
    </div>
  );
}

function FilePanel({ file, onClose, onChanged }: { file: MediaItem; onClose: () => void; onChanged: (f: MediaItem | null) => Promise<void> }) {
  const toast = useToast();
  const [alt, setAlt] = useState(file.alt);
  const [folder, setFolder] = useState(file.folder);
  const [name, setName] = useState(file.originalName);
  const [used, setUsed] = useState<MediaUsage[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<MediaUsage[] | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { apiFetch<{ usedOn: MediaUsage[] }>(`/api/cms/media/${file.id}`).then((r) => setUsed(r.usedOn)).catch(() => setUsed([])); }, [file.id]);
  const dirty = alt !== file.alt || folder !== file.folder || name !== file.originalName;

  async function save() {
    setSaving(true);
    try { const f = await apiFetch<MediaItem>(`/api/cms/media/${file.id}`, { method: "PATCH", body: { alt, folder, originalName: name } }); toast("Saved"); await onChanged({ ...file, ...f, url: file.url }); }
    catch (e) { toast((e as Error).message, "bad"); }
    setSaving(false);
  }
  async function remove(force: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/media/${file.id}${force ? "?force=1" : ""}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) { setWarn(body.usedOn ?? []); setConfirm(false); }
      else if (!res.ok) throw new Error(body.error || "Could not delete the file");
      else { toast("File deleted"); await onChanged(null); return; }
    } catch (e) { toast((e as Error).message, "bad"); }
    setSaving(false);
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-pop xl:static xl:z-auto xl:max-h-none xl:rounded-xl xl:shadow-card" aria-label="File details">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="min-w-0 truncate text-base font-semibold text-ink">{file.originalName}</h2>
        <button type="button" onClick={onClose} aria-label="Close panel" className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink"><X className="size-4" /></button>
      </div>
      <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2">
        {isImg(file) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.alt} className="size-full object-contain" />
        ) : <a href={file.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-sm text-accent"><FileText className="size-8" />Open PDF</a>}
      </div>
      <p className="mb-4 text-xs text-muted">{file.mimeType}{file.width ? ` · ${file.width}×${file.height}` : ""} · {fmtBytes(file.size)}</p>
      <div className="space-y-3">
        <Field label="File name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        {isImg(file) && <Field label="Alt text" hint="Describe the image for screen readers and Google."><Input value={alt} onChange={(e) => setAlt(e.target.value)} /></Field>}
        <Field label="Folder"><Select value={folder} onChange={(e) => setFolder(e.target.value)} options={FOLDERS.map((f) => ({ value: f, label: f }))} /></Field>
        <Field label="Address"><div className="flex gap-2"><Input readOnly value={file.url} className="font-mono text-xs" /><button type="button" aria-label="Copy address" className={buttonClass("secondary", "md", "px-2.5")} onClick={() => navigator.clipboard?.writeText(location.origin + file.url).then(() => toast("Address copied"))}><Copy className="size-4" /></button></div></Field>
        <button type="button" disabled={!dirty || saving} onClick={save} className={cn(buttonClass("primary", "md"), "w-full")}>{saving && <Loader2 className="size-4 animate-spin" />}Save changes</button>
      </div>

      <h3 className="mt-5 mb-2 text-[13px] font-semibold text-ink">Used in</h3>
      {used === null ? <p className="text-[13px] text-muted">Checking…</p> : used.length === 0 ? <p className="text-[13px] text-muted">Not used anywhere yet.</p> : (
        <ul className="space-y-1 text-[13px]">{used.map((u, i) => <li key={i}><Link href={u.link} className="text-accent hover:underline">{u.title}</Link> <span className="text-muted">({u.kind})</span></li>)}</ul>
      )}

      <div className="mt-5 border-t border-line pt-4">
        {warn && (
          <div className="mb-3 space-y-2">
            <Callout tone="warn" title="This file is still in use">Deleting it will leave broken images on: {warn.map((u) => u.title).join(", ")}.</Callout>
            <button type="button" disabled={saving} onClick={() => remove(true)} className={cn(buttonClass("danger", "md"), "w-full")}>Delete anyway</button>
          </div>
        )}
        {!warn && (confirm ? (
          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={() => remove(false)} className={cn(buttonClass("danger", "md"), "flex-1")}>Yes, delete</button>
            <button type="button" onClick={() => setConfirm(false)} className={buttonClass("secondary", "md")}>Cancel</button>
          </div>
        ) : <button type="button" onClick={() => setConfirm(true)} className={cn(buttonClass("danger", "md"), "w-full")}><Trash2 className="size-4" />Delete file</button>)}
      </div>
    </aside>
  );
}
