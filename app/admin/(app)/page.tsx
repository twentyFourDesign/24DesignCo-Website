import { CalendarClock, FileText, FolderKanban, Newspaper, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/cms/auth";
import { atLeast } from "@/lib/cms/roles";
import { overview } from "@/lib/cms/dashboard";
import { getSettings } from "@/lib/cms/settings";
import { Callout, Card, ButtonLink, EmptyState, Flash, Stat, StatusBadge } from "@/components/cms/ui/core";
import { PageHeader } from "@/components/cms/ui/layout";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/cms/ui/table";

const rel = (d: Date) => {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export default async function Overview({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const editor = atLeast(user.role, "editor");
  const [d, settings] = await Promise.all([overview(editor), getSettings()]);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: settings.availability.timezone }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = (user.name || "").split(" ")[0] || "there";
  const when = new Intl.DateTimeFormat("en-GB", { timeZone: settings.availability.timezone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const postHint = [d.posts.published && `${d.posts.published} published`, d.posts.review && `${d.posts.review} in review`, d.posts.drafts && `${d.posts.drafts} draft${d.posts.drafts === 1 ? "" : "s"}`, d.posts.scheduled && `${d.posts.scheduled} scheduled`].filter(Boolean).join(" · ") || "None yet";

  return (
    <>
      <PageHeader title={`${greeting}, ${first}`} description="Manage every page, article and booking on the website."
        actions={<><ButtonLink href="/admin/blog/new">New article</ButtonLink>{editor && <ButtonLink href="/admin/pages" variant="primary">Edit a page</ButtonLink>}</>} />
      <Flash error={sp.error} />
      {editor && d.unreadMessages > 0 && (
        <div className="mb-4"><Callout tone="info" title={`${d.unreadMessages} new message${d.unreadMessages === 1 ? "" : "s"} from the website`}><Link href="/admin/messages" className="font-medium text-accent hover:underline">Open Messages</Link> to read and reply.</Callout></div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {editor && <Stat label="Pages" value={d.pages.total} hint={`${d.pages.published} published${d.pages.changes ? ` · ${d.pages.changes} with unpublished changes` : ""}`} href="/admin/pages" icon={FileText} delay={0} />}
        <Stat label="Blog articles" value={d.posts.total} hint={postHint} href="/admin/blog" icon={Newspaper} delay={1} />
        {editor && <Stat label="Projects in Our Work" value={d.projects.total} hint={`${d.projects.cases} case ${d.projects.cases === 1 ? "study" : "studies"} · ${d.projects.partners} partnership${d.projects.partners === 1 ? "" : "s"}`} href="/admin/work" icon={FolderKanban} delay={2} />}
        {editor && <Stat label="Idea reviews this week" value={d.week} hint={d.upcoming[0] ? `Next: ${when.format(d.upcoming[0].startAt)}` : "None booked yet"} href="/admin/bookings" icon={CalendarClock} delay={3} />}
      </div>

      {editor && (
        <Card flush className="mt-6" title="Upcoming idea reviews" actions={<Link href="/admin/bookings" className="text-[13px] font-medium text-accent hover:underline">View all</Link>}>
          {d.upcoming.length ? (
            <Table><THead><Tr><Th>Founder</Th><Th>Idea</Th><Th>When</Th><Th>Status</Th></Tr></THead>
              <TBody>{d.upcoming.map((b) => (
                <Tr key={b.id}><Td><span className="font-medium">{b.name}</span><div className="text-xs text-muted">{b.email}</div></Td><Td className="max-w-md truncate">{String(b.idea).slice(0, 90)}</Td><Td className="whitespace-nowrap">{when.format(b.startAt)}</Td><Td><StatusBadge status={b.status} /></Td></Tr>
              ))}</TBody></Table>
          ) : <EmptyState title="No idea reviews booked yet">Bookings from the website&apos;s “Book a free idea review” button appear here.</EmptyState>}
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Recent changes" flush>
          {d.activity.length ? (
            <ul className="divide-y divide-line">
              {d.activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3 text-[13px]">
                  <span><span className="font-medium text-ink">{a.userName}</span> <span className="text-muted">{a.action}</span> {a.link ? <Link href={a.link} className="text-ink hover:text-accent hover:underline">{a.subject}</Link> : <span>{a.subject}</span>}</span>
                  <span className="shrink-0 text-xs text-faint">{rel(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="Nothing yet">Changes made in the admin show up here.</EmptyState>}
        </Card>
        {editor && (
          <Card title="Content to fix" description="Things that would make the site better" flush>
            {d.issues.length ? (
              <ul className="divide-y divide-line">
                {d.issues.slice(0, 10).map((i, n) => (
                  <li key={n}><Link href={i.link} className="flex items-start gap-3 px-5 py-3 text-[13px] hover:bg-surface-2">
                    {i.level === "warn" ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" /> : <Info className="mt-0.5 size-4 shrink-0 text-info" />}
                    <span className="text-ink-2">{i.text}</span></Link></li>
                ))}
                {d.issues.length > 10 && <li className="px-5 py-3 text-xs text-muted">and {d.issues.length - 10} more</li>}
              </ul>
            ) : <EmptyState title="All clear">No missing descriptions, placeholders or images found.</EmptyState>}
          </Card>
        )}
      </div>
    </>
  );
}
