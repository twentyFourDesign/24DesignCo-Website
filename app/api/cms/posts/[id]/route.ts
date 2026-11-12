import { api, forbidden, notFound, readJson, uuid } from "@/lib/cms/http";
import { requireApi } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { atLeast } from "@/lib/cms/roles";
import { bust, TAGS } from "@/lib/cms/revalidate";
import { logActivity } from "@/lib/cms/activity";
import { releaseScheduled } from "@/lib/cms/posts-server";
import { buildPost, updatePost, type PostRow } from "../shared";

type Ctx = { params: Promise<{ id: string }> };

async function load(ctx: Ctx) {
  const id = uuid((await ctx.params).id);
  const [post] = id ? await sql<PostRow[]>`select * from cms_posts where id = ${id}` : [];
  if (!post) throw notFound("Article");
  return post;
}

export const GET = api(async (_req: Request, ctx: Ctx) => {
  await requireApi("author");
  if ((await releaseScheduled()) > 0) bust(TAGS.posts);
  return await load(ctx);
});

export const PATCH = api(async (req: Request, ctx: Ctx) => {
  const user = await requireApi("author");
  const post = await load(ctx);
  const editor = atLeast(user.role, "editor");
  if (!editor && post.authorId !== user.id) throw forbidden("You can only edit your own articles");
  if (!editor && (post.status === "published" || post.status === "scheduled")) throw forbidden("This article is live. Ask an editor to change it.");
  const data = await buildPost(user, await readJson(req), post);
  const saved = await updatePost(user, post.id, data);
  const action = saved.status !== post.status
    ? saved.status === "published" ? "published" : saved.status === "scheduled" ? "scheduled" : `moved to ${saved.status}`
    : "updated";
  await logActivity(user, "post", action, `Article: ${saved.title}`, `/admin/blog/${saved.id}`);
  bust(TAGS.posts);
  return saved;
});

export const DELETE = api(async (_req: Request, ctx: Ctx) => {
  const user = await requireApi("author");
  const post = await load(ctx);
  if (!atLeast(user.role, "editor") && (post.authorId !== user.id || post.status === "published" || post.status === "scheduled")) throw forbidden();
  await sql`delete from cms_posts where id = ${post.id}`;
  await logActivity(user, "post", "deleted", `Article: ${post.title}`);
  bust(TAGS.posts);
  return { ok: true };
});
