import { api, badRequest, readJson, requireFields } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { STARTERS, cleanPath, pathProblem } from "@/lib/cms/sections";

export const GET = api(async (req: Request) => {
  await requireApi("editor");
  const q = new URL(req.url).searchParams.get("q")?.trim();
  const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const pages = await sql`select p.id, p.title, p.path, p.status, p.has_unpublished_changes, p.published_at, p.updated_at, u.name as updated_by_name,
      jsonb_array_length(p.sections) as section_count
    from cms_pages p left join cms_users u on u.id = p.updated_by
    ${like ? sql`where p.title ilike ${like} or p.path ilike ${like}` : sql``}
    order by p.sort_order, p.created_at`;
  return { pages };
});

export const POST = api(async (req: Request) => {
  const user = await requireApi("editor");
  const b = await readJson(req);
  requireFields(b, ["title", "path"]);
  const title = String(b.title).trim().slice(0, 150);
  const path = cleanPath(b.path);
  const problem = pathProblem(path);
  if (problem) throw badRequest(problem);
  const [dupe] = await sql`select id from cms_pages where path = ${path}`;
  if (dupe) throw badRequest("A page already exists at that path");
  const starter = STARTERS.find((s) => s.id === b.template) ?? STARTERS[0];
  const sections = starter.build(title);
  const [{ n }] = await sql`select count(*)::int as n from cms_pages`;
  const [page] = await sql`insert into cms_pages (title, path, status, sections, seo, has_unpublished_changes, updated_by, sort_order)
    values (${title}, ${path}, 'draft', ${sql.json(sections as never)}, ${sql.json({ metaTitle: `${title} | 24 Design Co.`, metaDescription: "" } as never)}, true, ${user.id}, ${n}) returning id`;
  await logActivity(user, "page", "created", `${title} page`, `/admin/pages/${page.id}`);
  return { id: page.id };
});
