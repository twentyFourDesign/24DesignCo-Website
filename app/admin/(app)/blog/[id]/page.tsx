import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { uuid } from "@/lib/cms/http";
import { releaseScheduled } from "@/lib/cms/posts-server";
import { atLeast } from "@/lib/cms/roles";
import ArticleEditor, { type EditorPost } from "../ArticleEditor";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = uuid((await params).id);
  if (!id) notFound();
  await releaseScheduled();
  const [row] = await sql`select * from cms_posts where id = ${id}`;
  if (!row) notFound();
  const slugs = await sql<{ slug: string }[]>`select slug from cms_posts where id <> ${id} order by slug`;
  const post = JSON.parse(JSON.stringify(row)) as EditorPost;
  const locked = !atLeast(user.role, "editor") && (post.authorId !== user.id || post.status === "published" || post.status === "scheduled");
  return <ArticleEditor post={post} role={user.role} userName={user.name} slugs={slugs.map((s) => s.slug)} locked={locked} />;
}
