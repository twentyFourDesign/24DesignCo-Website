import Link from "next/link";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { sql } from "@/lib/cms/db";
import { PageHeader } from "@/components/cms/ui/layout";
import { Badge, Card, EmptyState, StatusBadge } from "@/components/cms/ui/core";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";
import NewPage from "@/components/cms/pages/NewPage";
import DeletePage from "@/components/cms/pages/DeletePage";
import { BUILT_IN_PATHS } from "@/lib/cms/sections";
const fmtDateTime = (d: Date | string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

export default async function PagesList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser("editor");
  const q = ((await searchParams).q ?? "").trim();
  const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const pages = await sql`select p.id, p.title, p.path, p.status, p.has_unpublished_changes, p.updated_at, u.name as updated_by_name
    from cms_pages p left join cms_users u on u.id = p.updated_by
    ${like ? sql`where p.title ilike ${like} or p.path ilike ${like}` : sql``} order by p.sort_order, p.created_at`;
  return (
    <div>
      <PageHeader title="Pages" description="Every page of the website. Open one to edit its sections, then publish." actions={<NewPage />} />
      <Card flush>
        <form className="flex gap-2 border-b border-line px-4 py-3" role="search">
          <input name="q" defaultValue={q} placeholder="Search by title or path" aria-label="Search pages" className="h-9 w-full max-w-xs rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          <button className="h-9 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink-2 hover:bg-surface-2">Search</button>
          {q && <Link href="/admin/pages" className="inline-flex h-9 items-center px-2 text-sm text-muted hover:text-ink">Clear</Link>}
        </form>
        {pages.length === 0 ? (
          <EmptyState icon={<FileText className="size-5" />} title={q ? "No pages match" : "No pages yet"}>{q ? "Try a different search." : "Create your first page."}</EmptyState>
        ) : (
          <Table>
            <THead><tr><Th>Title</Th><Th>Path</Th><Th>Status</Th><Th>Last updated</Th><Th>{""}</Th></tr></THead>
            <TBody>
              {pages.map((p) => (
                <Tr key={p.id}>
                  <Td><Link href={`/admin/pages/${p.id}`} className="font-medium text-ink hover:text-accent">{p.title}</Link></Td>
                  <Td muted>{p.path}</Td>
                  <Td><span className="flex items-center gap-2"><StatusBadge status={p.status} />{p.hasUnpublishedChanges && <Badge tone="warn">Unpublished changes</Badge>}</span></Td>
                  <Td muted>{fmtDateTime(p.updatedAt)}{p.updatedByName ? ` · ${p.updatedByName}` : ""}</Td>
                  <Td align="right">{!BUILT_IN_PATHS.includes(p.path) && <DeletePage id={p.id} title={p.title} />}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
