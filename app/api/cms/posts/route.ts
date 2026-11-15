import { api, badRequest, readJson } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { bust, TAGS } from "@/lib/cms/revalidate";
import { logActivity } from "@/lib/cms/activity";
import { likeEscape } from "@/lib/cms/media-server";
import { releaseScheduled } from "@/lib/cms/posts-server";
import { buildPost, insertPost } from "./shared";

export const GET = api(async (req: Request) => {
  await requireApi("author");
  if ((await releaseScheduled()) > 0) bust(TAGS.posts);
  const u = new URL(req.url).searchParams;
  const status = u.get("status") || null;
  const category = u.get("category") || null;
  const q = u.get("q")?.trim() ? `%${likeEscape(u.get("q")!.trim())}%` : null;
  const posts = await sql`select id, title, slug, excerpt, category, author_id, author_name, status, published_at, featured_image, featured,
      reading_minutes, word_count, created_at, updated_at from cms_posts
    where (${status}::text is null or status = ${status}) and (${category}::text is null or category = ${category})
      and (${q}::text is null or title ilike ${q} or slug ilike ${q} or excerpt ilike ${q})
    order by coalesce(published_at, created_at) desc`;
  const rows = await sql<{ status: string; n: number }[]>`select status, count(*)::int as n from cms_posts group by status`;
  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) { counts[r.status] = r.n; counts.all += r.n; }
  return { posts, counts };
});

export const POST = api(async (req: Request) => {
  const user = await requireApi("author");
  const body = await readJson(req);
  if (!String(body.title ?? "").trim()) throw badRequest("Please add a title");
  const data = await buildPost(user, body, null);
  const post = await insertPost(user, data);
  await logActivity(user, "post", post.status === "published" ? "published" : "created", `Article: ${post.title}`, `/admin/blog/${post.id}`);
  bust(TAGS.posts);
  return Response.json(post, { status: 201 });
});
