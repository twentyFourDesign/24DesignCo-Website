import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { activityKinds, listActivity } from "@/lib/cms/activity-feed";
import { Card, EmptyState, ButtonLink } from "@/components/cms/ui/core";
import { PageHeader, Toolbar } from "@/components/cms/ui/layout";
import { FilterMenu } from "@/components/cms/ui/filter-menu";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const kinds = await activityKinds();
  const kind = kinds.includes(sp.kind ?? "") ? sp.kind! : "";
  const { items, total, page, pages } = await listActivity({ kind, page: Number(sp.page) || 1 });
  const href = (p: number) => `/admin/activity?${new URLSearchParams({ ...(kind ? { kind } : {}), page: String(p) })}`;
  return (
    <>
      <PageHeader title="Recent changes" description={`${total} ${total === 1 ? "entry" : "entries"}, newest first.`} />
      <Card flush>
        <Toolbar><FilterMenu param="kind" label="Type" current={kind || null} options={kinds.map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} /></Toolbar>
        {items.length === 0 ? <EmptyState title="Nothing here yet">Changes made in the admin and new bookings show up here.</EmptyState> : (
          <Table>
            <THead><tr><Th>When (Lagos)</Th><Th>Who</Th><Th>What</Th><Th>Type</Th></tr></THead>
            <TBody>
              {items.map((a) => (
                <Tr key={a.id}>
                  <Td className="whitespace-nowrap" muted>{fmt.format(a.createdAt)}</Td>
                  <Td>{a.userName || "Website"}</Td>
                  <Td>{a.action} {a.link ? <Link href={a.link} className="font-medium text-accent hover:underline">{a.subject}</Link> : <span className="font-medium">{a.subject}</span>}</Td>
                  <Td muted>{a.kind}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[13px] text-muted">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              {page > 1 && <ButtonLink size="sm" href={href(page - 1)}>Newer</ButtonLink>}
              {page < pages && <ButtonLink size="sm" href={href(page + 1)}>Older</ButtonLink>}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
