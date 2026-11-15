import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { uuid } from "@/lib/cms/http";
import PageEditor, { type PageRow } from "@/components/cms/pages/PageEditor";
import { loadSectionData } from "@/components/sections/CmsPage";
import type { BlogPost } from "@/lib/blog";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("editor");
  const id = uuid((await params).id);
  if (!id) notFound();
  const [p] = await sql`select id, title, path, status, has_unpublished_changes, published_at, sections, seo from cms_pages where id = ${id}`;
  if (!p) notFound();
  const data = await loadSectionData([{ type: "projects" }, { type: "posts" }, { type: "team" }]);
  // The preview only needs a few blog fields; leave the article bodies out.
  const posts = data.posts.map((x) => ({ slug: x.slug, title: x.title, description: x.description, category: x.category, readingMinutes: x.readingMinutes })) as unknown as BlogPost[];
  const page: PageRow = { id: p.id, title: p.title, path: p.path, status: p.status, hasUnpublishedChanges: p.hasUnpublishedChanges, publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null, sections: p.sections, seo: p.seo };
  return <PageEditor initial={page} data={{ ...data, posts }} />;
}
