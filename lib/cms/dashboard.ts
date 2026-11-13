import "server-only";
import { sql } from "./db";

export type Issue = { level: "info" | "warn"; text: string; link: string };

const hasPlaceholder = (v: unknown): boolean => {
  if (typeof v === "string") return /\[[A-Za-z][^\]]{1,40}\]/.test(v);
  if (Array.isArray(v)) return v.some(hasPlaceholder);
  if (v && typeof v === "object") return Object.values(v).some(hasPlaceholder);
  return false;
};

/** Things that need attention, shown as "Content to fix" on the Overview. */
export async function contentHealth(): Promise<Issue[]> {
  const issues: Issue[] = [];
  const pages = await sql`select id, title, status, seo, sections from cms_pages`;
  for (const p of pages) {
    const link = `/admin/pages/${p.id}`;
    if (!p.seo?.metaDescription) issues.push({ level: "info", text: `${p.title} page: meta description is missing`, link });
    const ph = (p.sections as { label: string; fields: unknown }[]).filter((s) => hasPlaceholder(s.fields)).map((s) => s.label);
    if (ph.length) issues.push({ level: "warn", text: `${p.title} page: placeholder text to replace (${[...new Set(ph)].join(", ")})`, link });
    if (p.status === "draft") issues.push({ level: "info", text: `${p.title} page is a draft and not visible on the website`, link });
  }
  const posts = await sql`select id, title from cms_posts where status <> 'draft' and coalesce(seo->>'metaDescription','') = ''`;
  for (const p of posts) issues.push({ level: "info", text: `Article "${p.title}": meta description is missing`, link: `/admin/blog/${p.id}` });
  const noCover = await sql`select id, name from cms_projects where status = 'published' and cover_image = '' and logo = ''`;
  for (const p of noCover) issues.push({ level: "warn", text: `Our Work: "${p.name}" has no image`, link: `/admin/work/${p.id}` });
  const [noPhoto] = await sql`select count(*)::int as n from cms_team where visible = true and (photo = '' or name = '')`;
  if (noPhoto.n) issues.push({ level: "warn", text: `Team: ${noPhoto.n} member${noPhoto.n > 1 ? "s need" : " needs"} a name or photo`, link: "/admin/team" });
  const [founder] = await sql`select name, research_area from cms_team where is_founder = true and visible = true`;
  if (founder && !founder.researchArea) issues.push({ level: "warn", text: `${founder.name}: add the PhD research area to the founder bio`, link: "/admin/team" });
  const [noAlt] = await sql`select count(*)::int as n from cms_media where mime_type like 'image/%' and alt = ''`;
  if (noAlt.n) issues.push({ level: "info", text: `Media: ${noAlt.n} image${noAlt.n > 1 ? "s have" : " has"} no alt text`, link: "/admin/media" });
  return issues;
}

export async function overview(canEdit: boolean) {
  const [pages] = await sql`select count(*)::int total, count(*) filter (where status = 'published')::int published, count(*) filter (where has_unpublished_changes)::int changes from cms_pages`;
  const [posts] = await sql`select count(*)::int total, count(*) filter (where status = 'published')::int published, count(*) filter (where status = 'review')::int review, count(*) filter (where status = 'draft')::int drafts, count(*) filter (where status = 'scheduled')::int scheduled from cms_posts`;
  const [projects] = await sql`select count(*)::int total, count(*) filter (where type = 'case-study')::int cases, count(*) filter (where type = 'partnership')::int partners from cms_projects`;
  const [team] = await sql`select count(*)::int n from cms_team where visible = true`;
  const [media] = await sql`select count(*)::int n from cms_media`;
  const upcoming = canEdit ? await sql`select id, name, email, idea, start_at, status from cms_bookings where start_at >= now() and status in ('pending','confirmed') order by start_at limit 5` : [];
  const [week] = canEdit ? await sql`select count(*)::int n from cms_bookings where start_at >= now() and start_at < now() + interval '7 days' and status in ('pending','confirmed')` : [{ n: 0 }];
  const [msgs] = canEdit ? await sql`select count(*)::int n from cms_messages where status = 'new'` : [{ n: 0 }];
  // Authors see content changes only, not who booked a call, sent a message or was invited.
  const activity = canEdit
    ? await sql`select id, user_name, kind, action, subject, link, created_at from cms_activity order by created_at desc limit 8`
    : await sql`select id, user_name, kind, action, subject, link, created_at from cms_activity where kind in ('page','post','project','team','media') order by created_at desc limit 8`;
  const issues = canEdit ? await contentHealth() : [];
  return { pages, posts, projects, team: team.n as number, media: media.n as number, upcoming, week: week.n as number, activity, issues, unreadMessages: msgs.n as number };
}
