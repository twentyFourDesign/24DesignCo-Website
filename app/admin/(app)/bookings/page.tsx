import { Download } from "lucide-react";
import { requireUser } from "@/lib/cms/auth";
import { getSettings } from "@/lib/cms/settings";
import { googleCalendarConfigured } from "@/lib/cms/googleCalendar";
import { bookingCounts, listBookings, parseScope } from "@/lib/cms/bookings";
import { ButtonLink, Card } from "@/components/cms/ui/core";
import { PageHeader, Tabs, Toolbar } from "@/components/cms/ui/layout";
import { SearchFilter } from "@/components/cms/ui/filter-menu";
import BookingsTable from "./BookingsTable";
import AvailabilityForm from "./AvailabilityForm";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ scope?: string; q?: string }> }) {
  await requireUser("editor");
  const sp = await searchParams;
  const availabilityTab = sp.scope === "availability";
  const scope = parseScope(sp.scope);
  const q = (sp.q ?? "").trim();
  const [counts, settings] = await Promise.all([bookingCounts(), getSettings()]);
  const tz = settings.availability.timezone;
  const tabs = [
    { id: "upcoming", label: "Upcoming", href: "/admin/bookings", count: counts.upcoming },
    { id: "past", label: "Past", href: "/admin/bookings?scope=past", count: counts.past },
    { id: "cancelled", label: "Cancelled", href: "/admin/bookings?scope=cancelled", count: counts.cancelled },
    { id: "availability", label: "Availability", href: "/admin/bookings?scope=availability" },
  ];

  let body;
  if (availabilityTab) {
    body = <AvailabilityForm initial={settings.availability} googleCalendar={{ configured: googleCalendarConfigured(), enabled: settings.integrations.googleCalendar.enabled }} />;
  } else {
    const rows = await listBookings(scope, q);
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const items = rows.map((b) => ({
      id: b.id, name: b.name, email: b.email, phone: b.phone, company: b.company, idea: b.idea, stage: b.stage, budget: b.budget, source: b.source,
      status: b.status, notes: b.notes, meetLink: b.meetLink, hasEvent: Boolean(b.calendarEventId),
      when: fmt.format(b.startAt), createdAt: fmt.format(b.createdAt),
    }));
    body = (
      <Card flush>
        <Toolbar><SearchFilter placeholder="Search name, email, company or idea" className="w-full sm:w-80" /></Toolbar>
        <BookingsTable items={items} empty={q ? "No idea reviews match that search." : `No ${scope} idea reviews.`} tz={tz} />
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Idea reviews"
        description="Free calls booked from the website. Open one to see the details, change its status or add private notes."
        actions={<ButtonLink href="/api/cms/bookings/export" prefetch={false}><Download className="size-4" aria-hidden />Export CSV</ButtonLink>}
      />
      <Tabs tabs={tabs} current={availabilityTab ? "availability" : scope} />
      {body}
    </>
  );
}
