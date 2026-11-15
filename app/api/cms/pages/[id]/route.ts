import { api, badRequest, notFound, readJson, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";
import { BUILT_IN_PATHS, SectionError, cleanPath, cleanSeo, pathProblem, validateSections } from "@/lib/cms/sections";

type Ctx = { params: Promise<{ id: string }> };

export const GET = api(async (_req: Request, { params }: Ctx) => {
  await requireApi("editor");
  const id = uuid((await params).id);
  if (!id) throw notFound("Page");
  const [page] = await sql`select * from cms_pages where id = ${id}`;
  if (!page) throw notFound("Page");
  return { page };
});

/** Save draft: changes the working copy only. */
export const PATCH = api(async (req: Request, { params }: Ctx) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  if (!id) throw notFound("Page");
  const [page] = await sql`select id, title, path, status from cms_pages where id = ${id}`;
  if (!page) throw notFound("Page");
  const b = await readJson(req);
  let title = page.title as string, path = page.path as string;
  if (b.title !== undefined) { title = String(b.title).trim().slice(0, 150); if (!title) throw badRequest("The page needs a title"); }
  if (b.path !== undefined && !BUILT_IN_PATHS.includes(page.path)) {
    path = cleanPath(b.path);
    const problem = pathProblem(path);
    if (problem) throw badRequest(problem);
    const [dupe] = await sql`select id from cms_pages where path = ${path} and id <> ${id}`;
    if (dupe) throw badRequest("A page already exists at that path");
  }
  try {
    const sections = b.sections !== undefined ? validateSections(b.sections) : null;
    const seo = b.seo !== undefined ? cleanSeo(b.seo) : null;
    await sql`update cms_pages set title = ${title}, path = ${path},
      sections = ${sections ? sql.json(sections as never) : sql`sections`}, seo = ${seo ? sql.json(seo as never) : sql`seo`},
      has_unpublished_changes = true, updated_by = ${user.id}, updated_at = now() where id = ${id}`;
  } catch (e) {
    if (e instanceof SectionError) throw badRequest(e.message);
    throw e;
  }
  if (page.status === "published" && path !== page.path) bust(TAGS.pages);
  await logActivity(user, "page", "saved as draft", `${title} page`, `/admin/pages/${id}`);
  const [saved] = await sql`select * from cms_pages where id = ${id}`;
  return { page: saved };
});

export const DELETE = api(async (_req: Request, { params }: Ctx) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  if (!id) throw notFound("Page");
  const [page] = await sql`select title, path from cms_pages where id = ${id}`;
  if (!page) throw notFound("Page");
  if (BUILT_IN_PATHS.includes(page.path)) throw badRequest("This is one of the main website pages and cannot be deleted. You can unpublish it instead.");
  await sql`delete from cms_pages where id = ${id}`;
  bust(TAGS.pages);
  await logActivity(user, "page", "deleted", `${page.title} page`);
  return { ok: true };
});
