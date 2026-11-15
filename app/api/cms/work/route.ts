import { api, badRequest, readJson, requireFields, slugify } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

export const GET = api(async (req: Request) => {
  await requireApi("editor");
  const type = new URL(req.url).searchParams.get("type");
  const rows = await sql`select id, slug, name, type, tag, summary, cover_image, logo, featured, status, sort_order from cms_projects ${type ? sql`where type = ${type}` : sql``} order by sort_order, created_at`;
  return { projects: rows };
});

export const POST = api(async (req: Request) => {
  const me = await requireApi("editor");
  const b = await readJson(req);
  requireFields(b, ["name"]);
  const name = String(b.name).trim();
  const slug = slugify(String(b.slug || name));
  if (!slug) throw badRequest("Enter a name for the project");
  const [dup] = await sql`select 1 from cms_projects where slug = ${slug}`;
  if (dup) throw badRequest("Another project already uses that web address. Change the name or address.");
  const type = b.type === "partnership" ? "partnership" : "case-study";
  const [{ n }] = await sql`select count(*)::int as n from cms_projects`;
  const [p] = await sql`insert into cms_projects (name, slug, type, status, sort_order) values (${name}, ${slug}, ${type}, 'draft', ${n}) returning id`;
  await logActivity(me, "project", "added", `Project: ${name}`, `/admin/work/${p.id}`);
  bust(TAGS.work);
  return { id: p.id };
});
