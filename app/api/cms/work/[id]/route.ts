import { api, badRequest, notFound, readJson, slugify, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

type Ctx = { params: Promise<{ id: string }> };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const strs = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);

export const GET = api(async (_req: Request, { params }: Ctx) => {
  await requireApi("editor");
  const id = uuid((await params).id);
  const [p] = id ? await sql`select * from cms_projects where id = ${id}` : [];
  if (!p) throw notFound("Project");
  return { project: p };
});

export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const me = await requireApi("editor");
  const id = uuid((await params).id);
  const [cur] = id ? await sql`select * from cms_projects where id = ${id}` : [];
  if (!cur) throw notFound("Project");
  const b = await readJson(req);
  const slug = b.slug !== undefined ? slugify(str(b.slug) || cur.name) : cur.slug;
  if (slug !== cur.slug) {
    const [dup] = await sql`select 1 from cms_projects where slug = ${slug} and id <> ${cur.id}`;
    if (dup) throw badRequest("Another project already uses that web address.");
  }
  let caseStudy = cur.caseStudy;
  if (b.caseStudy !== undefined) {
    if (b.caseStudy === null || b.caseStudy === "") caseStudy = null;
    else if (typeof b.caseStudy === "object" && !Array.isArray(b.caseStudy) && typeof (b.caseStudy as { name?: unknown }).name === "string") caseStudy = b.caseStudy;
    else throw badRequest("The case study content is not in the expected format");
  }
  const stats = Array.isArray(b.stats) ? (b.stats as { value?: unknown; label?: unknown }[]).map((s) => ({ value: str(s.value), label: str(s.label) })).filter((s) => s.value || s.label) : cur.stats;
  const links = b.links && typeof b.links === "object" ? { ...cur.links, ...(b.links as object) } : cur.links;
  const seo = b.seo && typeof b.seo === "object" ? { ...cur.seo, ...(b.seo as object) } : cur.seo;
  await sql`update cms_projects set
    name = ${b.name !== undefined ? str(b.name).trim() || cur.name : cur.name}, slug = ${slug},
    type = ${b.type === "partnership" || b.type === "case-study" ? b.type : cur.type},
    tag = ${b.tag !== undefined ? str(b.tag) : cur.tag}, summary = ${b.summary !== undefined ? str(b.summary) : cur.summary},
    services = ${b.services !== undefined ? strs(b.services) : cur.services}, logo = ${b.logo !== undefined ? str(b.logo) : cur.logo},
    cover_image = ${b.coverImage !== undefined ? str(b.coverImage) : cur.coverImage}, body = ${b.body !== undefined ? str(b.body) : cur.body},
    links = ${sql.json(links)}, stats = ${sql.json(stats)}, case_study = ${caseStudy === null ? null : sql.json(caseStudy)}, seo = ${sql.json(seo)},
    featured = ${b.featured !== undefined ? Boolean(b.featured) : cur.featured}, status = ${b.status === "draft" || b.status === "published" ? b.status : cur.status},
    updated_at = now() where id = ${cur.id}`;
  await logActivity(me, "project", "updated", `Project: ${cur.name}`, `/admin/work/${cur.id}`);
  bust(TAGS.work);
  return { ok: true, slug };
});

export const DELETE = api(async (_req: Request, { params }: Ctx) => {
  const me = await requireApi("editor");
  const id = uuid((await params).id);
  const [p] = id ? await sql`delete from cms_projects where id = ${id} returning name` : [];
  if (!p) throw notFound("Project");
  await logActivity(me, "project", "removed", `Project: ${p.name}`, "/admin/work");
  bust(TAGS.work);
  return { ok: true };
});
