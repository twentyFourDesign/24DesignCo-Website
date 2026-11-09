import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  author: string;
  date: string;
  category: string;
  keywords: string[];
  related: string[];
  featured: boolean;
  content: string;
  readingMinutes: number;
  faqs: { question: string; answer: string }[];
  headings: { id: string; text: string }[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
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
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim().replace(/\n+/g, " "),
    });
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

function parsePost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const keywords =
    typeof data.keywords === "string"
      ? data.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
      : Array.isArray(data.keywords)
        ? data.keywords
        : [];
  const related =
    typeof data.related === "string"
      ? data.related.split(",").map((k: string) => k.trim()).filter(Boolean)
      : Array.isArray(data.related)
        ? data.related
        : [];

  return {
    slug,
    title: String(data.title),
    seoTitle: String(data.seoTitle || data.title),
    description: String(data.description),
    author: String(data.author || "24 Design Co."),
    date: String(data.date),
    category: String(data.category || "Guides"),
    keywords,
    related,
    featured: Boolean(data.featured),
    content: content.trim(),
    readingMinutes: readingMinutes(content),
    faqs: extractFaqs(content),
    headings: extractHeadings(content),
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      return parsePost(slug, raw);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return parsePost(slug, fs.readFileSync(file, "utf8"));
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const all = getAllPosts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const related = post.related.map((slug) => bySlug.get(slug)).filter(Boolean) as BlogPost[];
  if (related.length >= limit) return related.slice(0, limit);
  const extras = all.filter(
    (p) => p.slug !== post.slug && !related.some((r) => r.slug === p.slug),
  );
  return [...related, ...extras].slice(0, limit);
}

export function getBlogCategories(posts: BlogPost[]) {
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  return ["All", ...cats.sort()];
}

export { slugify };
