import { api, badRequest, notFound, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";

/** Discard changes: resets the working copy to the last published version. */
export const POST = api(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  if (!id) throw notFound("Page");
  const [cur] = await sql`select published_at from cms_pages where id = ${id}`;
  if (!cur) throw notFound("Page");
  if (!cur.publishedAt) throw badRequest("This page has never been published, so there is nothing to go back to.");
  const [page] = await sql`update cms_pages set sections = published_sections, seo = published_seo, has_unpublished_changes = false, updated_by = ${user.id}, updated_at = now() where id = ${id} returning *`;
  await logActivity(user, "page", "discarded changes to", `${page.title} page`, `/admin/pages/${id}`);
  return { page };
});
