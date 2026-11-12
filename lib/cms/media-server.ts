import "server-only";
import { sql } from "./db";
import type { MediaItem, MediaUsage } from "./blog-shared";

const COLS = sql`id, filename, original_name, mime_type, size, width, height, alt, folder, created_at`;

type Row = Omit<MediaItem, "url" | "createdAt"> & { createdAt: Date };
const shape = (r: Row): MediaItem => ({ ...r, createdAt: new Date(r.createdAt).toISOString(), url: `/media/${r.id}/${r.filename}` });

export const likeEscape = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);

export async function listMedia(opts: { folder?: string; q?: string; type?: string; missingAlt?: boolean } = {}) {
  const folder = opts.folder?.trim() || null;
  const q = opts.q?.trim() ? `%${likeEscape(opts.q.trim())}%` : null;
  const imagesOnly = opts.type === "image";
  const rows = await sql<Row[]>`select ${COLS} from cms_media
    where (${folder}::text is null or folder = ${folder})
      and (${q}::text is null or original_name ilike ${q} or alt ilike ${q})
      and (${imagesOnly} = false or mime_type like 'image/%')
      and (${opts.missingAlt ?? false} = false or (alt = '' and mime_type like 'image/%'))
    order by created_at desc limit 500`;
  const counts = await sql<{ folder: string; n: number }[]>`select folder, count(*)::int as n from cms_media group by folder`;
  return { files: rows.map(shape), counts: Object.fromEntries(counts.map((c) => [c.folder, c.n])), total: counts.reduce((a, c) => a + c.n, 0) };
}

export async function getMedia(id: string): Promise<MediaItem | null> {
  const [r] = await sql<Row[]>`select ${COLS} from cms_media where id = ${id}`;
  return r ? shape(r) : null;
}

/** Where a file is referenced: page sections/seo, blog posts, projects, team members and site settings. */
export async function mediaUsage(id: string): Promise<MediaUsage[]> {
  const needle = `/media/${id}/`;
  const [pages, posts, projects, team, settings] = await Promise.all([
    sql`select id, title from cms_pages where position(${needle} in sections::text) > 0 or position(${needle} in published_sections::text) > 0 or position(${needle} in seo::text) > 0 or position(${needle} in published_seo::text) > 0`,
    sql`select id, title from cms_posts where position(${needle} in body) > 0 or position(${needle} in featured_image) > 0 or position(${needle} in seo::text) > 0`,
    sql`select id, name from cms_projects where position(${needle} in logo) > 0 or position(${needle} in cover_image) > 0 or position(${needle} in body) > 0 or position(${needle} in links::text) > 0 or position(${needle} in coalesce(case_study::text, '')) > 0`,
    sql`select id, name from cms_team where position(${needle} in photo) > 0 or position(${needle} in bio) > 0 or position(${needle} in links::text) > 0`,
    sql`select singleton from cms_settings where position(${needle} in data::text) > 0`,
  ]);
  return [
    ...pages.map((r) => ({ kind: "Page", title: String(r.title), link: `/admin/pages/${r.id}` })),
    ...posts.map((r) => ({ kind: "Blog article", title: String(r.title), link: `/admin/blog/${r.id}` })),
    ...projects.map((r) => ({ kind: "Our Work", title: String(r.name), link: `/admin/work/${r.id}` })),
    ...team.map((r) => ({ kind: "Team member", title: String(r.name || "Team member"), link: `/admin/team/${r.id}` })),
    ...settings.map(() => ({ kind: "Settings", title: "Site settings", link: "/admin/settings" })),
  ];
}
