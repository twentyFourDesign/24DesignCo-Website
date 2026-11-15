import { badRequest, forbidden } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { atLeast } from "@/lib/cms/roles";
import type { SessionUser } from "@/lib/cms/auth";
import { CATEGORIES, POST_STATUSES, readingMinutes, wordCount } from "@/lib/cms/blog-shared";
import { cleanList, uniqueSlug } from "@/lib/cms/posts-server";

export type PostRow = {
  id: string; title: string; slug: string; excerpt: string; body: string; category: string; authorId: string | null; authorName: string; status: string;
  publishedAt: Date | null; featuredImage: string; featuredImageAlt: string; ctaHeading: string; seo: { metaTitle?: string; metaDescription?: string };
  keywords: string[]; related: string[]; featured: boolean; faqSchema: boolean; showInKeepReading: boolean; readingMinutes: number; wordCount: number;
};

const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

/** Merges a request body over the existing post (if any), applying the role and status rules. Returns the full row to store. */
export async function buildPost(user: SessionUser, body: Record<string, unknown>, old: PostRow | null) {
  const editor = atLeast(user.role, "editor");
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
  const pick = <T,>(k: string, fallback: T, conv: (v: unknown) => T): T => (has(k) ? conv(body[k]) : fallback);

  const title = pick("title", old?.title ?? "", (v) => str(v, 200).trim());
  if (!title) throw badRequest("Please add a title");
  const category = pick("category", old?.category ?? "How to build", (v) => String(v));
  if (!(CATEGORIES as readonly string[]).includes(category)) throw badRequest("Unknown category");

  let status = pick("status", old?.status ?? "draft", (v) => String(v));
  if (!(POST_STATUSES as readonly string[]).includes(status)) throw badRequest("Invalid status");
  if (!editor && (status === "scheduled" || status === "published")) throw forbidden("Authors can save drafts or send for review. An editor publishes.");

  let publishedAt: Date | null = old?.publishedAt ?? null;
  if (editor && has("publishedAt")) {
    const raw = body.publishedAt;
    if (raw) {
      const d = new Date(String(raw));
      if (Number.isNaN(d.getTime())) throw badRequest("That date is not valid");
      publishedAt = d;
    } else if (status !== "published" && status !== "scheduled") publishedAt = null;
  }
  if (status === "scheduled") {
    if (!publishedAt || publishedAt.getTime() <= Date.now()) throw badRequest("Choose a future date and time to schedule this article");
  }
  if (status === "published" && !publishedAt) publishedAt = new Date();
  // Published with a date that is still ahead means "schedule it".
  if (status === "published" && publishedAt && publishedAt.getTime() > Date.now() + 60_000) status = "scheduled";

  const slugIn = has("slug") ? slugRaw(body.slug) : old?.slug ?? "";
  const slug = !old || slugIn !== old.slug ? await uniqueSlug(slugIn || title, old?.id) : old.slug;

  const text = pick("body", old?.body ?? "", (v) => str(v, 400_000));
  const words = wordCount(text);
  const oldSeo = old?.seo ?? {};
  const seoIn = has("seo") && body.seo && typeof body.seo === "object" ? (body.seo as Record<string, unknown>) : {};
  const seo = { ...oldSeo, ...(has("seo") ? { metaTitle: str(seoIn.metaTitle ?? oldSeo.metaTitle ?? "", 200), metaDescription: str(seoIn.metaDescription ?? oldSeo.metaDescription ?? "", 400) } : {}) };

  return {
    title, slug, status, publishedAt, category, seo,
    excerpt: pick("excerpt", old?.excerpt ?? "", (v) => str(v, 600)),
    body: text,
    authorName: pick("authorName", old?.authorName || user.name, (v) => str(v, 120).trim()) || user.name,
    featuredImage: pick("featuredImage", old?.featuredImage ?? "", (v) => str(v, 600).trim()),
    featuredImageAlt: pick("featuredImageAlt", old?.featuredImageAlt ?? "", (v) => str(v, 300)),
    ctaHeading: pick("ctaHeading", old?.ctaHeading ?? "Want to talk through your idea?", (v) => str(v, 200)),
    keywords: pick("keywords", old?.keywords ?? [], (v) => cleanList(v, 30, 80)),
    related: pick("related", old?.related ?? [], (v) => cleanList(v, 12, 100)),
    // Only editors decide what is featured.
    featured: editor ? pick("featured", old?.featured ?? false, Boolean) : old?.featured ?? false,
    faqSchema: pick("faqSchema", old?.faqSchema ?? true, Boolean),
    showInKeepReading: pick("showInKeepReading", old?.showInKeepReading ?? true, Boolean),
    wordCount: words,
    readingMinutes: readingMinutes(words),
  };
}
const slugRaw = (v: unknown) => String(v ?? "");

type Built = Awaited<ReturnType<typeof buildPost>>;

export async function insertPost(user: SessionUser, d: Built) {
  const [row] = await sql<PostRow[]>`insert into cms_posts
    (title, slug, excerpt, body, category, author_id, author_name, status, published_at, featured_image, featured_image_alt, cta_heading, seo,
     keywords, related, featured, faq_schema, show_in_keep_reading, reading_minutes, word_count, updated_by)
    values (${d.title}, ${d.slug}, ${d.excerpt}, ${d.body}, ${d.category}, ${user.id}, ${d.authorName}, ${d.status}, ${d.publishedAt}, ${d.featuredImage},
     ${d.featuredImageAlt}, ${d.ctaHeading}, ${sql.json(d.seo)}, ${d.keywords}, ${d.related}, ${d.featured}, ${d.faqSchema},
     ${d.showInKeepReading}, ${d.readingMinutes}, ${d.wordCount}, ${user.id})
    returning *`;
  return row;
}

export async function updatePost(user: SessionUser, id: string, d: Built) {
  const [row] = await sql<PostRow[]>`update cms_posts set
    title = ${d.title}, slug = ${d.slug}, excerpt = ${d.excerpt}, body = ${d.body}, category = ${d.category}, author_name = ${d.authorName},
    status = ${d.status}, published_at = ${d.publishedAt}, featured_image = ${d.featuredImage}, featured_image_alt = ${d.featuredImageAlt},
    cta_heading = ${d.ctaHeading}, seo = ${sql.json(d.seo)}, keywords = ${d.keywords}, related = ${d.related},
    featured = ${d.featured}, faq_schema = ${d.faqSchema}, show_in_keep_reading = ${d.showInKeepReading}, reading_minutes = ${d.readingMinutes},
    word_count = ${d.wordCount}, updated_by = ${user.id}, updated_at = now()
    where id = ${id} returning *`;
  return row;
}
