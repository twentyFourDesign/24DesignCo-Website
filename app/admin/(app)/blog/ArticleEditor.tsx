"use client";
import { useSiteHost } from "@/components/cms/useSiteHost";
import { ExternalLink, Loader2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownEditor from "@/components/cms/MarkdownEditor";
import MediaPicker from "@/components/cms/MediaPicker";
import { useToast } from "@/components/cms/Toast";
import { Badge, Callout, Card, cn } from "@/components/cms/ui/core";
import { buttonClass } from "@/components/cms/ui/button-style";
import { Check, Field, FormGrid, Input, Select, Textarea } from "@/components/cms/ui/form";
import { PageHeader } from "@/components/cms/ui/layout";
import { apiFetch } from "@/lib/cms/client";
import { CATEGORIES, SEO_SUFFIX, slugify, STATUS_LABEL, fromLagosInput, readingMinutes, toLagosInput, wordCount } from "@/lib/cms/blog-shared";
import { atLeast } from "@/lib/cms/roles";

export type EditorPost = {
  id: string; title: string; slug: string; excerpt: string; body: string; category: string; authorId: string | null; authorName: string; status: string;
  publishedAt: string | null; featuredImage: string; featuredImageAlt: string; ctaHeading: string; seo: { metaTitle?: string; metaDescription?: string };
  keywords: string[]; related: string[]; featured: boolean; faqSchema: boolean; showInKeepReading: boolean; updatedAt: string;
};

const BLANK = { title: "", slug: "", excerpt: "", body: "", category: "How to build", authorName: "", status: "draft", publishedAt: "", featuredImage: "", featuredImageAlt: "", ctaHeading: "Want to talk through your idea?", metaTitle: "", metaDescription: "", keywords: [] as string[], related: [] as string[], featured: false, faqSchema: true, showInKeepReading: true };
type Draft = typeof BLANK;

const fromPost = (p: EditorPost): Draft => ({
  title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body, category: p.category, authorName: p.authorName, status: p.status, publishedAt: toLagosInput(p.publishedAt),
  featuredImage: p.featuredImage, featuredImageAlt: p.featuredImageAlt, ctaHeading: p.ctaHeading, metaTitle: p.seo?.metaTitle ?? "", metaDescription: p.seo?.metaDescription ?? "",
  keywords: p.keywords, related: p.related, featured: p.featured, faqSchema: p.faqSchema, showInKeepReading: p.showInKeepReading,
});

function ListInput({ label, hint, value, onChange, suggestions = [], disabled }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; suggestions?: string[]; disabled?: boolean }) {
  const [text, setText] = useState("");
  const add = (raw: string) => { const t = raw.split(",").map((s) => s.trim()).filter(Boolean); if (t.length) onChange([...new Set([...value, ...t])]); setText(""); };
  const left = suggestions.filter((s) => !value.includes(s)).slice(0, 8);
  return (
    <div>
      <span className="mb-1 block text-[13px] font-medium text-ink-2">{label}</span>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2 py-1.5 shadow-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-accent-soft py-0.5 pr-1 pl-2.5 text-xs font-medium text-accent">
            {t}{!disabled && <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="rounded-full p-0.5 hover:bg-accent/15"><X className="size-3" /></button>}
          </span>
        ))}
        <input value={text} disabled={disabled} onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(text); } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1)); }}
          onBlur={() => text && add(text)} aria-label={label} placeholder={value.length ? "" : "Type and press Enter"} className="min-w-24 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none" />
      </div>
      {left.length > 0 && !disabled && <div className="mt-1.5 flex flex-wrap gap-1.5">{left.map((s) => <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-line-strong bg-surface px-2.5 py-0.5 text-xs text-ink-2 hover:border-accent hover:text-accent">+ {s}</button>)}</div>}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </div>
  );
}

export default function ArticleEditor({ post, role, userName, slugs, locked = false }: { post: EditorPost | null; role: string; userName: string; slugs: string[]; locked?: boolean }) {
  const siteHost = useSiteHost();
  const router = useRouter();
  const toast = useToast();
  const editor = atLeast(role, "editor");
  const [saved, setSaved] = useState<Draft>(() => (post ? fromPost(post) : { ...BLANK, authorName: userName }));
  const [d, setD] = useState<Draft>(saved);
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(saved) !== JSON.stringify(d);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const words = wordCount(d.body);
  const headings = (d.body.match(/^##\s/gm) || []).length;
  const metaTitle = d.metaTitle || `${d.title || "Your article"}${SEO_SUFFIX}`;
  const metaDesc = d.metaDescription || d.excerpt;

  async function save(target: string, label: string) {
    if (!d.title.trim()) return toast("Add a title first", "bad");
    if (target === "scheduled" && !d.publishedAt) return toast("Choose a date and time to schedule this article", "bad");
    setBusy(target);
    try {
      const body: Record<string, unknown> = {
        title: d.title, slug: d.slug, excerpt: d.excerpt, body: d.body, category: d.category, authorName: d.authorName, status: target,
        featuredImage: d.featuredImage, featuredImageAlt: d.featuredImageAlt, ctaHeading: d.ctaHeading, seo: { metaTitle: d.metaTitle, metaDescription: d.metaDescription },
        keywords: d.keywords, related: d.related, faqSchema: d.faqSchema, showInKeepReading: d.showInKeepReading,
      };
      if (editor) {
        body.featured = d.featured;
        if (d.publishedAt && (target === "scheduled" || target === "published")) body.publishedAt = fromLagosInput(d.publishedAt);
      }
      const res = post ? await apiFetch<EditorPost>(`/api/cms/posts/${post.id}`, { method: "PATCH", body }) : await apiFetch<EditorPost>("/api/cms/posts", { method: "POST", body });
      toast(res.status === "scheduled" && target === "published" ? "Scheduled for the date you chose" : label);
      const next = fromPost(res);
      setSaved(next); setD(next); setStatus(res.status);
      if (!post) router.replace(`/admin/blog/${res.id}`); else router.refresh();
    } catch (e) { toast((e as Error).message, "bad"); }
    setBusy(null);
  }

  async function remove() {
    setBusy("delete");
    try { await apiFetch(`/api/cms/posts/${post!.id}`, { method: "DELETE" }); toast("Article deleted"); setSaved(d); router.push("/admin/blog"); }
    catch (e) { toast((e as Error).message, "bad"); setBusy(null); }
  }

  const Spin = ({ k }: { k: string }) => (busy === k ? <Loader2 className="size-4 animate-spin" /> : null);
  const isLive = status === "published";
  const dis = locked || busy !== null;

  const actions = locked ? null : editor ? (
    <>
      {!isLive && <button type="button" disabled={dis} onClick={() => save(status === "review" ? "review" : "draft", "Draft saved")} className={buttonClass("secondary", "md")}><Spin k="draft" /><Spin k="review" />{status === "review" ? "Save" : "Save draft"}</button>}
      {isLive && <button type="button" disabled={dis} onClick={() => save("draft", "Moved back to draft")} className={buttonClass("secondary", "md")}><Spin k="draft" />Unpublish</button>}
      {!isLive && !!d.publishedAt && fromLagosInput(d.publishedAt) > new Date().toISOString() && <button type="button" disabled={dis} onClick={() => save("scheduled", "Scheduled")} className={buttonClass("secondary", "md")}><Spin k="scheduled" />Schedule</button>}
      <button type="button" disabled={dis} onClick={() => save("published", isLive ? "Updated" : "Published")} className={buttonClass("primary", "md")}><Spin k="published" />{isLive ? "Update" : "Publish now"}</button>
    </>
  ) : (
    <>
      <button type="button" disabled={dis} onClick={() => save("draft", "Draft saved")} className={buttonClass("secondary", "md")}><Spin k="draft" />Save draft</button>
      <button type="button" disabled={dis} onClick={() => save("review", "Sent for review")} className={buttonClass("primary", "md")}><Spin k="review" />Send for review</button>
    </>
  );

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Blog", href: "/admin/blog" }, { label: post ? "Edit article" : "New article" }]}
        title={post ? "Edit article" : "New article"}
        badge={post && <Badge tone={{ draft: "neutral", review: "warn", scheduled: "info", published: "ok" }[status] as "neutral"}>{STATUS_LABEL[status]}</Badge>}
        description={post ? `${status === "scheduled" ? "Goes live " : status === "published" ? "Published " : "Last saved "}${new Date(status === "draft" || status === "review" ? post.updatedAt : post.publishedAt ?? post.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })} (Lagos time)` : "Not saved yet"}
        actions={<>{post && status === "published" && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className={buttonClass("secondary", "md")}><ExternalLink className="size-4" />View live</a>}{actions}</>}
      />
      {locked && <div className="mb-5"><Callout tone="warn">You can view this article but not change it. {atLeast(role, "editor") ? "" : "Authors can only edit their own drafts that are not live."}</Callout></div>}

      <fieldset disabled={locked} className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <div className="space-y-4">
              <Field label="Title" required><Input value={d.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} className="h-11 text-lg font-semibold" /></Field>
              <Field label="Web address" hint={`/blog/${d.slug || "your-article"}`}><Input value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} className="font-mono text-[13px]" /></Field>
              <Field label="Summary" hint="Shown on the blog page and article cards."><Textarea rows={2} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
              <div>
                <span className="mb-1 block text-[13px] font-medium text-ink-2">Article</span>
                <MarkdownEditor value={d.body} onChange={(v) => set("body", v)} rows={22} />
                <p className="mt-1 text-xs text-muted">{words.toLocaleString()} words · {readingMinutes(words)} min read · {headings} headings. Use &ldquo;## &rdquo; for headings. A &ldquo;## Frequently asked questions&rdquo; section becomes FAQ rich results.</p>
              </div>
              <Field label="Call to action heading" hint="Shown in the box at the end of the article."><Input value={d.ctaHeading} onChange={(e) => set("ctaHeading", e.target.value)} /></Field>
            </div>
          </Card>
          <Card title="Related reading" description="Articles to suggest at the end of this one.">
            <div className="space-y-4">
              <ListInput label="Related article addresses" value={d.related} onChange={(v) => set("related", v)} suggestions={slugs} hint="Pick from the suggestions or type a slug." disabled={locked} />
              <ListInput label="Keywords" value={d.keywords} onChange={(v) => set("keywords", v)} hint="Search terms this article targets." disabled={locked} />
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card title="Publishing">
            <div className="space-y-3">
              {!editor && <p className="text-[13px] text-muted">Authors save drafts and send them for review. An editor publishes.</p>}
              {editor && !isLive && (
                <>
                  <Field label="Go live on (Lagos time)" hint="Leave empty to publish immediately. Pick a future time and press Schedule."><Input type="datetime-local" value={d.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} /></Field>
                </>
              )}
              {editor && isLive && <Field label="Publish date (Lagos time)"><Input type="datetime-local" value={d.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} /></Field>}
              <FormGrid>
                <Field label="Category"><Select value={d.category} onChange={(e) => set("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} /></Field>
                <Field label="Author name"><Input value={d.authorName} onChange={(e) => set("authorName", e.target.value)} /></Field>
              </FormGrid>
              {editor && <Check label="Featured article" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} />}
              <div><Check label="Show in &ldquo;Keep reading&rdquo;" checked={d.showInKeepReading} onChange={(e) => set("showInKeepReading", e.target.checked)} /></div>
            </div>
          </Card>
          <Card title="Featured image">
            <MediaPicker label="Image" value={d.featuredImage} onChange={(v) => set("featuredImage", v)} folder="Blog images" alt={d.featuredImageAlt} onAltChange={(v) => set("featuredImageAlt", v)} />
          </Card>
          <Card title="Search engine (SEO)">
            <div className="space-y-3">
              <Field label="Meta title" hint={<span className={cn(metaTitle.length > 60 && "text-warn")}>{metaTitle.length} of 60 characters</span>}><Input value={d.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} placeholder={metaTitle} /></Field>
              <Field label="Meta description" hint={<span className={cn((!d.metaDescription || d.metaDescription.length > 155) && "text-warn")}>{d.metaDescription.length} of 155 characters</span>}><Textarea rows={3} value={d.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
              <div className="rounded-lg border border-line bg-surface-2 p-3">
                <p className="mb-1 text-xs text-muted">Google preview</p>
                <p className="truncate text-[17px] leading-snug text-info">{metaTitle}</p>
                <p className="truncate text-xs text-ok">{siteHost} › blog › {d.slug || "your-article"}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-2">{metaDesc || "No description yet."}</p>
              </div>
              <Check label="FAQ rich results (from the FAQ section)" checked={d.faqSchema} onChange={(e) => set("faqSchema", e.target.checked)} />
            </div>
          </Card>
          {post && !locked && (
            <div>
              {confirmDelete ? (
                <div className="space-y-2 rounded-xl border border-bad-line bg-bad-soft p-4 text-[13px]">
                  <p className="text-ink">Delete &ldquo;{post.title}&rdquo; for good? It will be removed from the website.</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy !== null} onClick={remove} className={buttonClass("danger", "sm")}><Spin k="delete" />Yes, delete</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className={buttonClass("secondary", "sm")}>Cancel</button>
                  </div>
                </div>
              ) : <button type="button" onClick={() => setConfirmDelete(true)} className={buttonClass("danger", "md", "w-full")}><Trash2 className="size-4" />Delete article</button>}
            </div>
          )}
        </div>
      </fieldset>
      <p className="mt-5 text-sm"><Link href="/admin/blog" className="text-muted hover:text-ink">← All articles</Link></p>
    </>
  );
}
