import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { PageHeader, Tabs, Toolbar } from "@/components/cms/ui/layout";
import { Badge, ButtonLink, Card, EmptyState, type Tone } from "@/components/cms/ui/core";
import { SearchFilter } from "@/components/cms/ui/filter-menu";
import { Table, TBody, THead, Td, Th, Tr } from "@/components/cms/ui/table";
import { releaseScheduled } from "@/lib/cms/posts-server";
import { likeEscape } from "@/lib/cms/media-server";
import { STATUS_LABEL, POST_STATUSES } from "@/lib/cms/blog-shared";

const TONE: Record<string, Tone> = { draft: "neutral", review: "warn", scheduled: "info", published: "ok" };
const fmt = (d: Date | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }) : "—");

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const status = (POST_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "all";
  const q = sp.q?.trim() ? `%${likeEscape(sp.q.trim())}%` : null;
  await releaseScheduled();
  const [posts, rows] = await Promise.all([
    sql`select id, title, slug, category, author_name, status, published_at, updated_at, word_count from cms_posts
      where (${status === "all" ? null : status}::text is null or status = ${status}) and (${q}::text is null or title ilike ${q} or slug ilike ${q} or excerpt ilike ${q})
      order by coalesce(published_at, created_at) desc`,
    sql<{ status: string; n: number }[]>`select status, count(*)::int as n from cms_posts group by status`,
  ]);
  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) { counts[r.status] = r.n; counts.all += r.n; }
  const href = (s: string) => `/admin/blog${s === "all" ? "" : `?status=${s}`}${q && sp.q ? `${s === "all" ? "?" : "&"}q=${encodeURIComponent(sp.q)}` : ""}`;

  return (
    <>
      <PageHeader title="Blog" description="Write, review and publish articles." actions={<ButtonLink href="/admin/blog/new" variant="primary"><Plus className="size-4" />New article</ButtonLink>} />
      <Tabs current={status} tabs={[{ id: "all", label: "All", href: href("all"), count: counts.all }, ...POST_STATUSES.map((s) => ({ id: s, label: STATUS_LABEL[s], href: href(s), count: counts[s] ?? 0 }))]} />
      <Card flush>
        <Toolbar><SearchFilter placeholder="Search articles" className="w-72" /></Toolbar>
        {posts.length === 0 ? (
          <EmptyState title="No articles found">{sp.q ? "Try a different search." : "Write your first article to get started."}</EmptyState>
        ) : (
          <Table>
            <THead><tr><Th>Title</Th><Th>Category</Th><Th>Author</Th><Th>Status</Th><Th>Date</Th><Th align="right">Words</Th></tr></THead>
            <TBody>
              {posts.map((p) => (
                <Tr key={String(p.id)}>
                  <Td><Link href={`/admin/blog/${p.id}`} className="font-medium text-ink hover:text-accent">{String(p.title)}</Link><div className="text-xs text-muted">/blog/{String(p.slug)}</div></Td>
                  <Td muted>{String(p.category)}</Td>
                  <Td muted>{String(p.authorName)}</Td>
                  <Td><Badge tone={TONE[String(p.status)] ?? "neutral"}>{STATUS_LABEL[String(p.status)] ?? String(p.status)}</Badge></Td>
                  <Td muted>{fmt(p.publishedAt as Date | null)}</Td>
                  <Td align="right" muted>{Number(p.wordCount).toLocaleString()}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
