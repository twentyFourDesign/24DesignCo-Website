import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import "./env";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import postgres from "postgres";
import { zonedTime } from "../lib/cms/time";

// Adds every markdown article in content/blog to cms_posts as a published post. Safe to re-run: an article that is already in
// the database is left alone, so edits made in the admin are never overwritten. Pass --force to replace them with the markdown files.
const force = process.argv.includes("--force");
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  const dir = path.join(process.cwd(), "content/blog");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const body = content.trim();
    const words = body.split(/\s+/).filter(Boolean).length;
    const date = String(data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date);
    const seo = { metaTitle: String(data.seoTitle || ""), metaDescription: String(data.description || "") };
    const v = {
      title: String(data.title), excerpt: String(data.description || ""), body, category: String(data.category || "How to build"),
      author: String(data.author || "24 Design Co."), publishedAt: zonedTime(date, "08:00", "Africa/Lagos"), words,
      minutes: Math.max(1, Math.ceil(words / 220)), featured: Boolean(data.featured),
    };
    const done = await sql`insert into cms_posts (title, slug, excerpt, body, category, author_name, status, published_at, cta_heading, seo, keywords, related, featured, faq_schema, show_in_keep_reading, reading_minutes, word_count)
      values (${v.title}, ${slug}, ${v.excerpt}, ${v.body}, ${v.category}, ${v.author}, 'published', ${v.publishedAt}, 'Ready to turn this into a build plan?', ${sql.json(seo)},
        ${list(data.keywords)}, ${list(data.related)}, ${v.featured}, true, true, ${v.minutes}, ${v.words})
      on conflict (slug) do ${force ? sql`update set title = excluded.title, excerpt = excluded.excerpt, body = excluded.body, category = excluded.category,
        author_name = excluded.author_name, status = 'published', published_at = excluded.published_at, seo = excluded.seo, keywords = excluded.keywords,
        related = excluded.related, featured = excluded.featured, reading_minutes = excluded.reading_minutes, word_count = excluded.word_count, updated_at = now()` : sql`nothing`}
      returning slug`;
    console.log(done.length ? `${force ? "Replaced" : "Added"} ${slug}` : `skip ${slug} (already in the database)`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
