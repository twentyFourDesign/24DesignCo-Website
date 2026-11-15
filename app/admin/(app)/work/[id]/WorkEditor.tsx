"use client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Callout, Card } from "@/components/cms/ui/core";
import { Check, Field, FormGrid, Input, Select, Textarea } from "@/components/cms/ui/form";
import MediaPicker from "@/components/cms/MediaPicker";
import MarkdownEditor from "@/components/cms/MarkdownEditor";
import { apiFetch } from "@/lib/cms/client";
import { useToast } from "@/components/cms/Toast";

type P = {
  id: string; name: string; slug: string; type: string; tag: string; summary: string; services: string[]; logo: string; coverImage: string; body: string;
  links: { website?: string; appStore?: string; googlePlay?: string }; stats: { value: string; label: string }[]; caseStudy: unknown; seo: { metaTitle?: string; metaDescription?: string };
  featured: boolean; status: string;
};

export default function WorkEditor({ project }: { project: P }) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState(project);
  const [services, setServices] = useState(project.services.join("\n"));
  const [json, setJson] = useState(project.caseStudy ? JSON.stringify(project.caseStudy, null, 2) : "");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof P>(k: K, v: P[K]) => setP((x) => ({ ...x, [k]: v }));

  async function save(extra: Partial<P> = {}) {
    let caseStudy: unknown = null;
    if (json.trim()) { try { caseStudy = JSON.parse(json); } catch { toast("The case study content is not valid JSON, so nothing was saved.", "bad"); return; } }
    setSaving(true);
    try {
      const next = { ...p, ...extra };
      const res = await apiFetch<{ slug: string }>(`/api/cms/work/${p.id}`, { method: "PATCH", body: { ...next, services: services.split("\n"), caseStudy } });
      setP({ ...next, slug: res.slug });
      toast(extra.status === "published" ? "Published" : "Saved");
      router.refresh();
    } catch (e) { toast((e as Error).message, "bad"); } finally { setSaving(false); }
  }
  async function remove() {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await apiFetch(`/api/cms/work/${p.id}`, { method: "DELETE" }); router.push("/admin/work"); router.refresh(); } catch (e) { toast((e as Error).message, "bad"); }
  }

  return (
    <div className="space-y-6">
      <Card title="Details" actions={<span className="text-[13px] text-muted">{p.status === "published" ? "Live on the website" : "Draft: not on the website"}</span>}>
        <FormGrid>
          <Field label="Name" required><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Web address" hint={`/our-work/${p.slug}`}><Input value={p.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
          <Field label="Type"><Select value={p.type} onChange={(e) => set("type", e.target.value)} options={[{ value: "case-study", label: "Case study (startup)" }, { value: "partnership", label: "Ongoing partnership" }]} /></Field>
          <Field label="Small label above the name" hint="For example: BOOKING PLATFORM · ONGOING CTO SUPPORT"><Input value={p.tag} onChange={(e) => set("tag", e.target.value)} /></Field>
        </FormGrid>
        <Field label="Short description" className="mt-4" hint="Shown on cards on the home and Our Work pages."><Textarea value={p.summary} onChange={(e) => set("summary", e.target.value)} rows={3} /></Field>
        <Field label="What we did" className="mt-4" hint="One item per line. Shown as the checklist on partnership cards."><Textarea value={services} onChange={(e) => setServices(e.target.value)} rows={4} /></Field>
        <div className="mt-4 flex flex-wrap gap-6"><Check label="Show on the home page" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} /></div>
      </Card>

      <Card title="Images">
        <FormGrid>
          <MediaPicker label="Cover image (screenshot)" value={p.coverImage} onChange={(v) => set("coverImage", v)} folder="Illustrations" />
          <MediaPicker label="Client logo" value={p.logo} onChange={(v) => set("logo", v)} folder="Client logos" />
        </FormGrid>
      </Card>

      <Card title="Links and numbers">
        <FormGrid cols={3}>
          <Field label="Website"><Input value={p.links.website ?? ""} onChange={(e) => set("links", { ...p.links, website: e.target.value })} placeholder="https://" /></Field>
          <Field label="App Store link"><Input value={p.links.appStore ?? ""} onChange={(e) => set("links", { ...p.links, appStore: e.target.value })} placeholder="https://" /></Field>
          <Field label="Google Play link"><Input value={p.links.googlePlay ?? ""} onChange={(e) => set("links", { ...p.links, googlePlay: e.target.value })} placeholder="https://" /></Field>
        </FormGrid>
        <p className="mb-2 mt-5 text-[13px] font-medium text-ink-2">Headline numbers <span className="font-normal text-muted">(shown on partnership cards, for example 99% · Uptime. Type “since 2022-02” as the number to show a counter that updates itself every month)</span></p>
        <div className="space-y-2">
          {p.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input className="w-36" value={s.value} placeholder="99% or since 2022-02" title="Type since YYYY-MM to show a counter that updates every month, e.g. since 2022-02 shows 4 yrs 9 mos" onChange={(e) => set("stats", p.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <Input value={s.label} placeholder="Uptime" onChange={(e) => set("stats", p.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <Button type="button" variant="ghost" aria-label="Remove" onClick={() => set("stats", p.stats.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          <Button type="button" size="sm" onClick={() => set("stats", [...p.stats, { value: "", label: "" }])}><Plus className="size-4" /> Add a number</Button>
        </div>
      </Card>

      <Card title="Case study page" description="The text of the full page at /our-work/…">
        {json ? <Callout tone="info" title="This project uses the full designed case study layout">Its content is stored as structured data below. Edit with care, or clear the box to use a simple page built from the text below instead.</Callout> : null}
        <Field label="Case study text (Markdown)" className="mt-4" hint={json ? "Ignored while the designed layout data below is present." : "Used when there is no designed layout data."}><MarkdownEditor value={p.body} onChange={(v) => set("body", v)} /></Field>
        <details className="mt-5 rounded-lg border border-line">
          <summary className="cursor-pointer px-4 py-2.5 text-[13px] font-medium text-ink-2">Advanced: designed case study layout data (JSON)</summary>
          <div className="p-4"><Textarea value={json} onChange={(e) => setJson(e.target.value)} rows={16} className="font-mono text-xs" spellCheck={false} /></div>
        </details>
      </Card>

      <Card title="Search engines">
        <FormGrid>
          <Field label="Page title"><Input value={p.seo.metaTitle ?? ""} onChange={(e) => set("seo", { ...p.seo, metaTitle: e.target.value })} /></Field>
          <Field label="Description"><Textarea rows={2} value={p.seo.metaDescription ?? ""} onChange={(e) => set("seo", { ...p.seo, metaDescription: e.target.value })} /></Field>
        </FormGrid>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="button" variant="danger" onClick={remove}>Delete project</Button>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/work">Back</ButtonLink>
          {p.status === "published" ? <Button type="button" onClick={() => save({ status: "draft" })} disabled={saving}>Unpublish</Button> : null}
          <Button type="button" onClick={() => save()} disabled={saving}>Save</Button>
          {p.status !== "published" && <Button type="button" variant="primary" onClick={() => save({ status: "published" })} disabled={saving}>Save and publish</Button>}
        </div>
      </div>
    </div>
  );
}
