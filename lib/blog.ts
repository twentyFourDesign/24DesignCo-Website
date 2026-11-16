import { cacheLife, cacheTag } from "next/cache";
import { sql } from "@/lib/cms/db";
import { TAGS } from "@/lib/cms/revalidate";
import { BLOG_ZONE } from "@/lib/cms/blog-shared";
import { zonedDateStr } from "@/lib/cms/time";

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  /** Short summary for cards; falls back to the meta description. */
  excerpt: string;
  author: string;
  date: string;
  /** Last edited, for the sitemap and structured data (YYYY-MM-DD, never earlier than `date`). */
  updated: string;
  category: string;
  keywords: string[];
  related: string[];
  featured: boolean;
  content: string;
  readingMinutes: number;
  faqs: { question: string; answer: string }[];
  headings: { id: string; text: string }[];
  // Added by the CMS
  ctaHeading: string;
  image: string;
  imageAlt: string;
  showInKeepReading: boolean;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractFaqs(content: string) {
  const faqs: { question: string; answer: string }[] = [];
  const faqIndex = content.search(/^## Frequently asked questions\s*$/m);
  if (faqIndex === -1) return faqs;

  const section = content.slice(faqIndex).replace(/^## Frequently asked questions\s*\n/, "");
  const blocks = section.split(/\n(?=\*\*)/).filter(Boolean);

  for (const block of blocks) {
    const match = block.match(/^\*\*(.+?)\*\*\s*\n([\s\S]+)$/);
    if (!match) continue;
    faqs.push({ question: match[1].trim(), answer: match[2].trim().replace(/\n+/g, " ") });
  }
  return faqs;
}

function extractHeadings(content: string) {
  const headings: { id: string; text: string }[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^##\s+(.+)$/);
    if (!match) continue;
    const text = match[1].trim();
    headings.push({ id: slugify(text), text });
  }
  return headings;
}

type Row = {
  slug: string; title: string; excerpt: string; body: string; category: string; authorName: string; publishedAt: Date | null; featuredImage: string;
  featuredImageAlt: string; ctaHeading: string; seo: { metaTitle?: string; metaDescription?: string }; keywords: string[]; related: string[];
  featured: boolean; faqSchema: boolean; showInKeepReading: boolean; readingMinutes: number; updatedAt: Date | null;
};

function fromRow(p: Row): BlogPost {
  const content = (p.body || "").trim();
  return {
    slug: p.slug,
    title: p.title,
    seoTitle: (p.seo?.metaTitle || "").replace(/\s*\|\s*24 Design Co\.?$/i, "").trim() || p.title,
    description: p.seo?.metaDescription || p.excerpt,
    excerpt: (p.excerpt || "").trim() || p.seo?.metaDescription || "",
    author: p.authorName || "24 Design Co.",
    date: zonedDateStr(new Date(p.publishedAt ?? Date.now()), BLOG_ZONE),
    updated: [zonedDateStr(new Date(p.publishedAt ?? Date.now()), BLOG_ZONE), zonedDateStr(new Date(p.updatedAt ?? p.publishedAt ?? Date.now()), BLOG_ZONE)].sort()[1],
    category: p.category === "Guides" || !p.category ? "How to build" : p.category,
    keywords: p.keywords ?? [],
    related: p.related ?? [],
    featured: p.featured,
    content,
    readingMinutes: p.readingMinutes || 1,
    faqs: p.faqSchema === false ? [] : extractFaqs(content),
    headings: extractHeadings(content),
    ctaHeading: p.ctaHeading || "Ready to turn this into a build plan?",
    image: p.featuredImage || "",
    imageAlt: p.featuredImageAlt || "",
    showInKeepReading: p.showInKeepReading,
  };
}

/** Published posts, plus scheduled ones whose time has passed. Newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.posts);
  const rows = await sql<Row[]>`select * from cms_posts
    where (status = 'published' or (status = 'scheduled' and published_at <= now()))
    order by published_at desc nulls last, created_at desc`;
  return rows.map(fromRow);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife({ revalidate: 60, expire: 3600 });
  cacheTag(TAGS.posts);
  const [row] = await sql<Row[]>`select * from cms_posts
    where slug = ${slug} and (status = 'published' or (status = 'scheduled' and published_at <= now())) limit 1`;
  return row ? fromRow(row) : null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = await getAllPosts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const related = post.related.map((slug) => bySlug.get(slug)).filter(Boolean) as BlogPost[];
  const extras = all.filter((p) => p.showInKeepReading && p.slug !== post.slug && !related.some((r) => r.slug === p.slug));
  // Hand-picked articles first, then others; within those, the same category comes first.
  const same = (p: BlogPost) => (p.category === post.category ? 0 : 1);
  const picks = [...related].sort((a, b) => same(a) - same(b));
  const rest = [...extras].sort((a, b) => same(a) - same(b));
  return [...picks, ...rest].slice(0, limit);
}

export function getBlogCategories(posts: BlogPost[]) {
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  return ["All", ...cats.sort()];
}

export { slugify };
