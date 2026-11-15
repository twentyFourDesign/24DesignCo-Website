import { api, notFound, uuid } from "@/lib/cms/http";
import { sql } from "@/lib/cms/db";
import { requireApi } from "@/lib/cms/auth";
import { logActivity } from "@/lib/cms/activity";
import { bust, TAGS } from "@/lib/cms/revalidate";

/** Publish: copies the working copy to what visitors see. */
export const POST = api(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApi("editor");
  const id = uuid((await params).id);
  if (!id) throw notFound("Page");
  const [page] = await sql`update cms_pages set published_sections = sections, published_seo = seo, status = 'published', published_at = now(),
    has_unpublished_changes = false, updated_by = ${user.id}, updated_at = now() where id = ${id} returning *`;
  if (!page) throw notFound("Page");
  bust(TAGS.pages);
  await logActivity(user, "page", "published", `${page.title} page`, `/admin/pages/${id}`);
  return { page };
});
