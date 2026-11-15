import "server-only";
import { sql } from "./db";
import { slugify } from "./http";

/** Scheduled posts go live when their time passes. Done on read (no cron). Returns how many were released. */
export async function releaseScheduled() {
  const rows = await sql`update cms_posts set status = 'published', updated_at = now() where status = 'scheduled' and published_at <= now() returning id`;
  return rows.length;
}

export async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "article";
  let slug = root;
  let n = 1;
  for (;;) {
    const [hit] = await sql`select 1 as x from cms_posts where slug = ${slug} and (${excludeId ?? null}::uuid is null or id <> ${excludeId ?? null}::uuid)`;
    if (!hit) return slug;
    slug = `${root.slice(0, 85)}-${++n}`;
  }
}

export const cleanList = (v: unknown, max = 30, len = 120): string[] =>
  Array.isArray(v) ? [...new Set(v.map((x) => String(x).trim().slice(0, len)).filter(Boolean))].slice(0, max) : [];
