import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { atLeast } from "@/lib/cms/roles";
import { likeEscape } from "@/lib/cms/media-server";
import { PageHeader } from "@/components/cms/ui/layout";
import { Badge, Card, EmptyState } from "@/components/cms/ui/core";

type Hit = { href: string; title: string; sub?: string; badge?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const editor = atLeast(user.role, "editor");
  const like = `%${likeEscape(q)}%`;
  const run = async (fn: () => Promise<Hit[]>) => (q.length >= 2 ? fn() : []);

  const [posts, pages, projects, team, media, bookings] = await Promise.all([
    run(async () => (await sql`select id, title, slug, status from cms_posts where title ilike ${like} or slug ilike ${like} or excerpt ilike ${like} order by updated_at desc limit 8`)
      .map((r) => ({ href: `/admin/blog/${r.id}`, title: String(r.title), sub: `/blog/${r.slug}`, badge: String(r.status) }))),
    editor ? run(async () => (await sql`select id, title, path, status from cms_pages where title ilike ${like} or path ilike ${like} order by sort_order limit 8`)
      .map((r) => ({ href: `/admin/pages/${r.id}`, title: String(r.title), sub: String(r.path), badge: String(r.status) }))) : [],
    editor ? run(async () => (await sql`select id, name, slug, type from cms_projects where name ilike ${like} or slug ilike ${like} or summary ilike ${like} order by sort_order limit 8`)
      .map((r) => ({ href: `/admin/work/${r.id}`, title: String(r.name), sub: String(r.type) }))) : [],
    editor ? run(async () => (await sql`select id, name, role from cms_team where name ilike ${like} or role ilike ${like} order by sort_order limit 8`)
      .map((r) => ({ href: `/admin/team/${r.id}`, title: String(r.name), sub: String(r.role) }))) : [],
    editor ? run(async () => (await sql`select id, original_name, alt, folder from cms_media where original_name ilike ${like} or alt ilike ${like} order by created_at desc limit 8`)
      .map((r) => ({ href: "/admin/media", title: String(r.originalName), sub: r.alt ? String(r.alt) : undefined, badge: String(r.folder) }))) : [],
    editor ? run(async () => (await sql`select id, name, email, idea, start_at from cms_bookings where name ilike ${like} or email ilike ${like} or idea ilike ${like} order by start_at desc limit 8`)
      .map((r) => ({ href: "/admin/bookings", title: `${r.name} (${r.email})`, sub: String(r.idea).slice(0, 100) }))) : [],
  ]);

  const groups: { title: string; hits: Hit[] }[] = [
    { title: "Blog articles", hits: posts }, { title: "Pages", hits: pages }, { title: "Our Work", hits: projects },
    { title: "Team", hits: team }, { title: "Media", hits: media }, { title: "Idea reviews", hits: bookings },
  ];
  const visible = groups.filter((g) => g.hits.length);

  return (
    <>
      <PageHeader title="Search" description={q ? `Results for “${q}”` : "Search articles, pages, projects, team, files and idea reviews."} />
      <form action="/admin/search" method="get" role="search" className="mb-6 max-w-xl">
        <input name="q" defaultValue={q} autoFocus type="search" placeholder="Search everything…" aria-label="Search" className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink shadow-card focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
      </form>
      {q.length < 2 ? (
        <Card><EmptyState title="Type at least two letters">Search matches titles, names, addresses, alt text and idea descriptions.</EmptyState></Card>
      ) : visible.length === 0 ? (
        <Card><EmptyState title="Nothing found">Try a different word.</EmptyState></Card>
      ) : (
        <div className="space-y-5">
          {visible.map((g) => (
            <Card key={g.title} title={g.title} description={`${g.hits.length} result${g.hits.length > 1 ? "s" : ""}`} flush>
              <ul className="divide-y divide-line">
                {g.hits.map((h, i): ReactNode => (
                  <li key={i}>
                    <Link href={h.href} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2">
                      <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{h.title}</span>{h.sub && <span className="block truncate text-xs text-muted">{h.sub}</span>}</span>
                      {h.badge && <Badge>{h.badge}</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
