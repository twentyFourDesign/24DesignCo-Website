"use client";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Field, Input, Select } from "@/components/cms/ui/form";
import { buttonClass } from "@/components/cms/ui/button-style";
import { cn } from "@/components/cms/ui/core";
import { useToast } from "@/components/cms/Toast";
import { apiFetch } from "@/lib/cms/client";
import { uploadFiles } from "@/lib/cms/upload";
import { FOLDERS, type MediaItem } from "@/lib/cms/blog-shared";

const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) || url.startsWith("data:image/");

/**
 * Pick an image for a field: shows a thumbnail, opens the library to choose or upload, and still lets you paste a URL.
 * `value` is an image URL (a library file is "/media/<id>/<filename>"). `folder` suggests where uploads go.
 */
export default function MediaPicker({ label = "Image", value, onChange, folder = "Other", alt, onAltChange }: { label?: string; value: string; onChange: (url: string) => void; folder?: string; alt?: string; onAltChange?: (alt: string) => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  // Remembers which address failed to load, so choosing a new image clears the error without an effect.
  const [brokenUrl, setBrokenUrl] = useState("");
  const broken = brokenUrl === value;

  return (
    <div className="space-y-2">
      <span className="block text-[13px] font-medium text-ink-2">{label}</span>
      <div className="flex items-start gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2 text-faint">
          {value && !broken && isImage(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt || ""} onError={() => setBrokenUrl(value)} className="size-full object-contain" />
          ) : value ? <FileText className="size-6" aria-hidden /> : <ImageIcon className="size-6" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass("secondary", "sm")} onClick={() => { setOpen(true); dlg.current?.showModal(); }}>{value ? "Change" : "Choose from library"}</button>
            {value && <button type="button" className={buttonClass("ghost", "sm")} onClick={() => onChange("")}>Remove</button>}
          </div>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or paste https://…" aria-label={`${label} URL`} className="h-8 text-[13px]" />
        </div>
      </div>
      {onAltChange && <Field label="Alt text" hint="Describe the image for people using screen readers."><Input value={alt ?? ""} onChange={(e) => onAltChange(e.target.value)} /></Field>}

      <dialog ref={dlg} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl rounded-xl border border-line bg-surface p-0 shadow-pop open:flex open:flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Choose an image</h2>
          <button type="button" aria-label="Close" onClick={() => dlg.current?.close()} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink"><X className="size-4" /></button>
        </header>
        {open && <Library initialFolder={folder} onPick={(a) => { onChange(a.url); if (onAltChange && a.alt && !alt) onAltChange(a.alt); dlg.current?.close(); }} />}
      </dialog>
    </div>
  );
}

function Library({ initialFolder, onPick }: { initialFolder: string; onPick: (m: MediaItem) => void }) {
  const toast = useToast();
  const [folder, setFolder] = useState<string>((FOLDERS as readonly string[]).includes(initialFolder) ? initialFolder : "");
  const [q, setQ] = useState("");
  const [files, setFiles] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ type: "image" });
    if (folder) p.set("folder", folder);
    if (q.trim()) p.set("q", q.trim());
    try { setFiles((await apiFetch<{ files: MediaItem[] }>(`/api/cms/media?${p}`)).files); } catch (e) { toast((e as Error).message, "bad"); setFiles([]); }
  }, [folder, q, toast]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  async function upload(list: FileList | File[]) {
    const arr = Array.from(list);
    if (!arr.length) return;
    setBusy(true);
    const r = await uploadFiles(arr, folder || initialFolder);
    r.errors.forEach((m) => toast(m, "bad"));
    if (r.files.length === 1 && arr.length === 1) onPick(r.files[0]);
    else if (r.files.length) { toast(`${r.files.length} file${r.files.length > 1 ? "s" : ""} uploaded`); await load(); }
    setBusy(false);
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", drag && "bg-accent-soft")} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
        <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-44" aria-label="Folder" options={[{ value: "", label: "All folders" }, ...FOLDERS.map((f) => ({ value: f, label: f }))]} />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text" aria-label="Search" className="w-56" />
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" multiple hidden onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className={cn(buttonClass("primary", "md"), "ml-auto")}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Upload{folder ? ` to ${folder}` : ""}
        </button>
      </div>
      <div className="min-h-64 overflow-y-auto p-5">
        {files === null ? <p className="py-10 text-center text-sm text-muted">Loading…</p> : files.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No images here yet. Upload one, or drop a file anywhere in this window.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => onPick(f)} className="group block w-full overflow-hidden rounded-lg border border-line bg-surface text-left hover:border-accent focus-visible:ring-2 focus-visible:ring-accent/40">
                  <span className="flex aspect-square items-center justify-center bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.alt} loading="lazy" className="size-full object-contain" />
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs text-ink-2">{f.originalName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
