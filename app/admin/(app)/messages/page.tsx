import { Download } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { atLeast } from "@/lib/cms/roles";
import { getSettings } from "@/lib/cms/settings";
import { listMessages, messageCounts, parseMessageScope } from "@/lib/cms/messages";
import { ButtonLink, Card } from "@/components/cms/ui/core";
import { PageHeader, Tabs, Toolbar } from "@/components/cms/ui/layout";
import { SearchFilter } from "@/components/cms/ui/filter-menu";
import MessagesTable from "./MessagesTable";
import MessageAlerts from "./MessageAlerts";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ scope?: string; q?: string }> }) {
  const user = await requireUser("editor");
  const sp = await searchParams;
  const scope = parseMessageScope(sp.scope);
  const q = (sp.q ?? "").trim();
  const [counts, rows, settings] = await Promise.all([messageCounts(), listMessages(scope, q), getSettings()]);
  const tz = settings.availability.timezone;
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const items = rows.map((m) => ({
    id: m.id, name: m.name, email: m.email, whatsapp: m.whatsapp, message: m.message, stage: m.stage, page: m.page,
    status: m.status, notes: m.notes, received: fmt.format(m.createdAt),
  }));
  const tabs = [
    { id: "inbox", label: "Inbox", href: "/admin/messages", count: counts.inbox },
    { id: "archived", label: "Archived", href: "/admin/messages?scope=archived", count: counts.archived },
  ];

  return (
    <>
      <PageHeader
        title="Messages"
        description={`Sent from the "Prefer to write?" form on the website.${counts.unread ? ` ${counts.unread} new.` : ""} Open one to read it, reply by email and keep notes.`}
        actions={<ButtonLink href="/api/cms/messages/export" prefetch={false}><Download className="size-4" aria-hidden />Export CSV</ButtonLink>}
      />
      <MessageAlerts alertEmail={settings.messages.alertEmail} emailConfigured={Boolean(process.env.SMTP_URL)} canEdit={atLeast(user.role, "admin")} />
      <Tabs tabs={tabs} current={scope} />
      <Card flush>
        <Toolbar><SearchFilter placeholder="Search name, email, WhatsApp or message" className="w-full sm:w-80" /></Toolbar>
        <MessagesTable items={items} empty={q ? "No messages match that search." : scope === "archived" ? "No archived messages." : "No messages yet."} />
      </Card>
    </>
  );
}
