"use client";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";
import { Card, StatusBadge, Badge, cn } from "@/components/cms/ui/core";
import { buttonClass } from "@/components/cms/ui/button-style";
import { Check, Field, Input, Textarea } from "@/components/cms/ui/form";
import MediaPicker from "@/components/cms/MediaPicker";
import FieldEditor from "./FieldEditor";
import PreviewFrame from "./PreviewFrame";
import type { SectionData } from "@/components/sections/Sections";
import { BUILT_IN_PATHS, SECTION_TYPES, SECTION_TYPE_IDS, newSection, type Section, type SectionType, type Seo } from "@/lib/cms/sections";
import { useSiteHost } from "@/components/cms/useSiteHost";

export type PageRow = { id: string; title: string; path: string; status: "draft" | "published"; hasUnpublishedChanges: boolean; publishedAt: string | null; sections: Section[]; seo: Seo };

const withDefaults = (list: Section[]): Section[] => list.map((s) => ({ ...s, fields: { ...(SECTION_TYPES[s.type]?.fields ?? {}), ...(s.fields ?? {}) } }));
const btn = (v: "primary" | "secondary" | "ghost" | "danger" = "secondary") => buttonClass(v, "md");
const small = "inline-flex size-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent";

export default function PageEditor({ initial, data }: { initial: PageRow; data: SectionData }) {
  const siteHost = useSiteHost();
  const toast = useToast();
  const [page, setPage] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [path, setPath] = useState(initial.path);
  const [sections, setSections] = useState<Section[]>(() => withDefaults(initial.sections));
  const [seo, setSeo] = useState<Seo>(initial.seo ?? {});
  const [sel, setSel] = useState<string | null>(initial.sections[0]?.key ?? null);
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);
  const builtIn = BUILT_IN_PATHS.includes(initial.path);

  const edit = useCallback(<T,>(set: (v: T) => void) => (v: T) => { set(v); setDirty(true); }, []);
  const setSecs = (next: Section[]) => { setSections(next); setDirty(true); };
  const patchSection = (key: string, p: Partial<Section>) => setSecs(sections.map((s) => (s.key === key ? { ...s, ...p } : s)));
  const selected = sections.find((s) => s.key === sel) ?? null;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const apply = (p: Partial<PageRow> & Record<string, unknown>, resetForm = false) => {
    const merged = { ...page, ...p } as PageRow;
    setPage(merged);
    if (resetForm) { setSections(withDefaults(merged.sections)); setSeo(merged.seo ?? {}); setTitle(merged.title); setPath(merged.path); setSel((k) => (merged.sections.some((s) => s.key === k) ? k : merged.sections[0]?.key ?? null)); }
    setDirty(false);
  };

  const run = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    try { await fn(); } catch (e) { toast((e as Error).message, "bad"); } finally { setBusy(""); }
  };
  const saveCall = async () => {
    const r = await apiFetch<{ page: PageRow }>(`/api/cms/pages/${page.id}`, { method: "PATCH", body: { title, path: builtIn ? undefined : path, sections, seo } });
    apply({ ...r.page, sections: page.sections, seo: page.seo }); // keep the form as typed; only status flags change
    setPage((p) => ({ ...p, ...r.page }));
  };
  const save = () => run("save", async () => { await saveCall(); toast("Draft saved"); });
  const publish = () => run("publish", async () => {
    if (dirty) await saveCall();
    const r = await apiFetch<{ page: PageRow }>(`/api/cms/pages/${page.id}/publish`, { method: "POST" });
    setPage((p) => ({ ...p, ...r.page })); setDirty(false);
    toast("Published. The website now shows this version.");
  });
  const unpublish = () => { if (!confirm("Unpublish this page? Visitors will see a “page not found” message until you publish again.")) return; void run("unpublish", async () => {
    const r = await apiFetch<{ page: PageRow }>(`/api/cms/pages/${page.id}/unpublish`, { method: "POST" });
    setPage((p) => ({ ...p, ...r.page })); toast("Unpublished");
  }); };
  const discard = () => { if (!confirm("Discard all changes since the last publish? This cannot be undone.")) return; void run("discard", async () => {
    const r = await apiFetch<{ page: PageRow }>(`/api/cms/pages/${page.id}/discard`, { method: "POST" });
    apply(r.page, true); toast("Changes discarded");
  }); };

  // ── section list actions ──
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= sections.length) return;
    const c = [...sections];
    [c[i], c[j]] = [c[j], c[i]];
    setSecs(c);
  };
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const c = [...sections];
    const [m] = c.splice(from, 1);
    c.splice(to, 0, m);
    setSecs(c);
  };
  const dup = (i: number) => {
    const s = sections[i];
    const copy: Section = { ...structuredClone(s), key: `${s.type}-${Math.random().toString(36).slice(2, 8)}`, label: `${s.label} copy` };
    const c = [...sections]; c.splice(i + 1, 0, copy); setSecs(c); setSel(copy.key);
  };
  const del = (i: number) => {
    if (!confirm(`Delete “${sections[i].label}”?`)) return;
    const c = sections.filter((_, j) => j !== i);
    setSecs(c);
    if (sel === sections[i].key) setSel(c[Math.min(i, c.length - 1)]?.key ?? null);
  };
  const add = (type: SectionType) => {
    const s = newSection(type);
    const at = selected ? sections.findIndex((x) => x.key === selected.key) + 1 : sections.length;
    const c = [...sections]; c.splice(at, 0, s); setSecs(c); setSel(s.key); setAdding(false); setTab("content");
  };

  const previewSections = useMemo(() => sections, [sections]);
  const live = page.status === "published";
  const gtitle = seo.metaTitle || `${title} | 24 Design Co.`;
  const canPublish = dirty || !live || page.hasUnpublishedChanges;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <nav className="mb-1 text-[13px] text-muted"><Link href="/admin/pages" className="hover:text-ink">Pages</Link> / <span className="text-ink-2">{path}</span></nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <input aria-label="Page title" value={title} onChange={(e) => edit(setTitle)(e.target.value)} className="min-w-0 max-w-md flex-1 rounded-lg border border-transparent bg-transparent px-1 text-2xl font-semibold tracking-tight text-ink hover:border-line-strong focus:border-accent focus:outline-none" />
            <StatusBadge status={page.status} />
            {(dirty || page.hasUnpublishedChanges) && <Badge tone="warn">{dirty ? "Unsaved changes" : "Unpublished changes"}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {live && <a href={path} target="_blank" rel="noreferrer" className={btn()}>View live ↗</a>}
          {page.hasUnpublishedChanges && page.publishedAt && <button type="button" onClick={discard} disabled={!!busy} className={btn()}>Discard changes</button>}
          {live && <button type="button" onClick={unpublish} disabled={!!busy} className={btn("danger")}>Unpublish</button>}
          <button type="button" onClick={save} disabled={!!busy || !dirty} className={btn()}>{busy === "save" ? "Saving…" : "Save draft"}</button>
          <button type="button" onClick={publish} disabled={!!busy || !canPublish} className={btn("primary")}>{busy === "publish" ? "Publishing…" : live ? "Publish changes" : "Publish"}</button>
        </div>
      </div>

      <div className="mb-3 flex gap-2 xl:hidden">
        <button type="button" onClick={() => setPane("edit")} className={cn(btn(pane === "edit" ? "primary" : "secondary"))}>Edit</button>
        <button type="button" onClick={() => setPane("preview")} className={cn(btn(pane === "preview" ? "primary" : "secondary"))}>Preview</button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Sections */}
        <div className={cn("space-y-3", pane === "preview" && "hidden xl:block")}>
          <Card title="Sections" description="Drag to reorder." flush actions={<button type="button" onClick={() => setAdding((a) => !a)} className={buttonClass("secondary", "sm")}><Plus className="size-3.5" /> Add</button>}>
            {adding && (
              <div className="grid gap-1 border-b border-line bg-surface-2 p-2">
                {SECTION_TYPE_IDS.map((t) => (
                  <button key={t} type="button" onClick={() => add(t)} className="rounded-md px-2.5 py-1.5 text-left hover:bg-surface"><span className="block text-[13px] font-medium text-ink">{SECTION_TYPES[t].label}</span><span className="block text-xs text-muted">{SECTION_TYPES[t].description}</span></button>
                ))}
              </div>
            )}
            <ul>
              {sections.map((s, i) => (
                <li key={s.key}
                  draggable
                  onDragStart={(e) => { setDrag({ from: i, over: i }); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", s.key); }}
                  onDragOver={(e) => { e.preventDefault(); if (drag && drag.over !== i) setDrag({ ...drag, over: i }); }}
                  onDrop={(e) => { e.preventDefault(); if (drag) reorder(drag.from, i); setDrag(null); }}
                  onDragEnd={() => setDrag(null)}
                  className={cn("border-b border-line last:border-b-0", drag && drag.over === i && drag.from !== i && "border-t-2 border-t-accent", drag?.from === i && "opacity-50")}>
                  <div className={cn("flex items-center gap-1 px-2 py-1.5", s.key === sel && tab === "content" ? "bg-accent-soft" : "hover:bg-surface-2")}>
                    <span className="cursor-grab text-faint" aria-hidden><GripVertical className="size-4" /></span>
                    <button type="button" onClick={() => { setSel(s.key); setTab("content"); setPane("edit"); }} className="min-w-0 flex-1 text-left">
                      <span className={cn("block truncate text-[13px] font-medium", s.visible ? "text-ink" : "text-muted line-through")}>{s.label}</span>
                      <span className="block truncate text-xs text-muted">{SECTION_TYPES[s.type]?.label ?? s.type}{!s.visible && " · hidden"}</span>
                    </button>
                    <div className="flex shrink-0">
                      <button type="button" className={small} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${s.label} up`}><ArrowUp className="size-3.5" /></button>
                      <button type="button" className={small} onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label={`Move ${s.label} down`}><ArrowDown className="size-3.5" /></button>
                    </div>
                  </div>
                </li>
              ))}
              {sections.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-muted">No sections yet. Use Add.</li>}
            </ul>
          </Card>
          <div className="px-1 text-xs text-muted">
            <button type="button" onClick={() => setTab("seo")} className={cn("font-medium hover:text-ink", tab === "seo" && "text-accent")}>Search and sharing (SEO)</button>
          </div>
        </div>

        {/* Editor */}
        <div className={cn("min-w-0", pane === "preview" && "hidden xl:block")}>
          {tab === "seo" ? (
            <Card title="Search and sharing" description="How this page appears in Google and when shared.">
              <div className="space-y-4">
                <Field label="Meta title" hint={`${(seo.metaTitle ?? "").length} characters. Aim for under 60.`}><Input value={seo.metaTitle ?? ""} onChange={(e) => edit(setSeo)({ ...seo, metaTitle: e.target.value })} placeholder={`${title} | 24 Design Co.`} /></Field>
                <Field label="Meta description" hint={`${(seo.metaDescription ?? "").length} characters. Aim for 120 to 160. Leave empty to use the site default.`}><Textarea rows={3} value={seo.metaDescription ?? ""} onChange={(e) => edit(setSeo)({ ...seo, metaDescription: e.target.value })} /></Field>
                <MediaPicker label="Share image" value={seo.ogImage ?? ""} onChange={(u) => edit(setSeo)({ ...seo, ogImage: u })} folder="Pages" />
                <Check label="Ask search engines not to list this page (noindex)" checked={!!seo.noIndex} onChange={(e) => edit(setSeo)({ ...seo, noIndex: e.target.checked })} />
                <div className="rounded-lg border border-line bg-surface-2 p-4">
                  <p className="mb-2 text-xs font-medium text-muted">Google result preview</p>
                  <p className="truncate text-xs text-ink-2">{siteHost}{path === "/" ? "" : path}</p>
                  <p className="truncate text-lg text-info">{gtitle}</p>
                  <p className="line-clamp-2 text-[13px] text-muted">{seo.metaDescription || "No description set. Search engines will pick text from the page, or the site default."}</p>
                </div>
                {!builtIn && (
                  <Field label="Page path" hint="The address of this page, for example /pricing."><Input value={path} onChange={(e) => edit(setPath)(e.target.value)} /></Field>
                )}
              </div>
            </Card>
          ) : selected ? (
            <Card
              title={selected.label}
              description={SECTION_TYPES[selected.type]?.label}
              actions={
                <>
                  <button type="button" className={buttonClass("secondary", "sm")} onClick={() => patchSection(selected.key, { visible: !selected.visible })}>{selected.visible ? <><EyeOff className="size-3.5" /> Hide</> : <><Eye className="size-3.5" /> Show</>}</button>
                  <button type="button" className={buttonClass("secondary", "sm")} onClick={() => dup(sections.indexOf(selected))}><Copy className="size-3.5" /> Duplicate</button>
                  <button type="button" className={buttonClass("danger", "sm")} onClick={() => del(sections.indexOf(selected))}><Trash2 className="size-3.5" /> Delete</button>
                </>
              }
            >
              <div className="space-y-4">
                <Field label="Section name" hint="Only shown here, in the admin."><Input value={selected.label} onChange={(e) => patchSection(selected.key, { label: e.target.value })} /></Field>
                <FieldEditor key={selected.key} type={selected.type} fields={selected.fields} onChange={(f) => patchSection(selected.key, { fields: f })} />
                <Field label="Anchor" hint="Lets a button link to this section, for example #start. Leave empty if not needed."><Input value={String(selected.fields.anchor ?? "")} onChange={(e) => patchSection(selected.key, { fields: { ...selected.fields, anchor: e.target.value.replace(/[^a-z0-9_-]/gi, "") } })} /></Field>
                {["projects", "team", "posts"].includes(selected.type) && <p className="rounded-lg bg-surface-2 p-3 text-xs text-muted">The items in this section come from {selected.type === "projects" ? "Our Work" : selected.type === "team" ? "Team" : "the Blog"}. Edit them there.</p>}
              </div>
            </Card>
          ) : <Card><p className="py-8 text-center text-sm text-muted">Select a section to edit it, or add one.</p></Card>}
        </div>

        {/* Preview */}
        <div className={cn("min-w-0", pane === "edit" && "hidden xl:block")}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-2">Live preview</span>
            <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
              {([["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]] as const).map(([m, Ic, l]) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium", mode === m ? "bg-surface text-ink shadow-card ring-1 ring-line" : "text-muted hover:text-ink")}><Ic className="size-3.5" />{l}</button>
              ))}
            </div>
          </div>
          <PreviewFrame sections={previewSections} data={data} mode={mode} />
        </div>
      </div>
    </div>
  );
}
