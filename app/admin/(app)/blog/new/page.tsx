import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import ArticleEditor from "../ArticleEditor";

export default async function NewArticle() {
  const user = await requireUser();
  const others = await sql<{ slug: string }[]>`select slug from cms_posts order by slug`;
  return <ArticleEditor post={null} role={user.role} userName={user.name} slugs={others.map((o) => o.slug)} />;
}
